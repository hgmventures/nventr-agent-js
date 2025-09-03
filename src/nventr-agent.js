/**
 * The init function returns an object with the following methods:
 *
 * render: Function
 * This function is used to render the chatbot interface with the given options.
 * The options object can have the following properties:
 * - fullscreen: If true, the chatbot will be rendered in fullscreen mode.
 * - collapse: If true, the chatbot will be rendered in collapsed mode.
 * - dev: If true, the chatbot will use the development server.
 * - id or agentAccessKey: The access key for the agent.
 *
 * These options can also be passed directly to the URL when including the agent. For example:
 * https://yourserver.com/agent.js?id=yourid&fullscreen=true&collapse=false&dev=true
 *
 * addActionCallback: Function
 * This function is used to register a callback function for a specific action.
 * The action is a string that specifies the action, and the callback is a function that is called when the action is received.
 * The function also accepts an optional data object that is sent to the server when the callback is registered.
 * The function returns an object with a remove method that can be used to remove the callback.
 *
 * onAction: Function
 * This function is used to register a callback for a single action.
 * The action is a string that specifies the action, and the callback is a function that is called when the action is received.
 *
 * onActions: Function
 * This function is used to register multiple callbacks for different actions.
 * The actions object is a key-value pair where the key is the action string and the value is the callback function.
 *
 * restore: Function
 * This function is used to restore the chatbot to its normal state from either fullscreen or collapsed state.
 *
 * collapse: Function
 * This function is used to collapse the chatbot to a minimized state.
 *
 * fullscreen: Function
 * This function is used to make the chatbot go into fullscreen mode.
 *
 * remove: Function
 * This function is used to remove the chatbot interface from the document.
 *
 * margin: Function
 * This function is used to set the initial margin of the chatbot interface.
 *
 * radius: Function
 * This function is used to set the initial radius of the chatbot interface.
 *
 * theme: Function
 * This function is used to set the theme key of the chatbot interface.
 *
 * height: Function
 * This function is used to set the initial height of the chatbot interface.
 *
 * width: Function
 * This function is used to set the initial width of the chatbot interface.
 *
 */
function init() {
  const wrapper = document.createElement("div");
  const handle = document.createElement("div");
  const collapseButton = document.createElement("div");
  const fullscreenButton = document.createElement("div");
  const fabButton = document.createElement("div");
  const iframe = document.createElement("iframe");
  const dragContainer = document;
  // const CHATBOT_HEIGHT = 448;
  // const agentState.width = 352;
  // const CHATBOT_MARGIN = 16;
  // const CHATBOT_RADIUS = 4;

  const WINDOW_STATE_NONE = "NONE";
  const WINDOW_STATE_COLLAPSED = "COLLAPSED";
  const WINDOW_STATE_FULLSCREEN = "FULLSCREEN";
  const COLLAPSED_TYPE_MINIMIZED = "MINIMIZED";
  const COLLAPSED_TYPE_FAB = "FAB";
  const CHATBOT_COLLAPSED_HEIGHT = 36;
  const layout = {
    collapsed: {
      [COLLAPSED_TYPE_MINIMIZED]: {
        height: 36,
      },
      [COLLAPSED_TYPE_FAB]: {
        height: 56,
        width: 56,
        borderRadius: 16,
        margin: 16,
      },
    },
  };
  const actionListeners = [];
  const agentState = {
    visible: false,
    rendered: false,
    onRendered: null,
    onAction: null,
    onActions: null,
    webhookAccessToken: null,
    metadata: null,
    height: 448,
    width: 352,
    margin: 16,
    radius: 16,
    zIndex: 10,
    windowState: WINDOW_STATE_NONE,
    collapsedType: COLLAPSED_TYPE_FAB,
  };
  window.addEventListener("message", function (event) {
    if (!event || !event.data || event.data.source !== "nventr-agent") return;
    const parseAction = (action) => ({
      name: action.name,
      value: action.value ? JSON.parse(action.value) : null,
    });
    const parseActions = (actions) =>
      actions
        .map((action) => parseAction(action))
        .filter((action) => action && action.name);
    const handleAction = (name, value) => {
      actionListeners.forEach((callback) => {
        if (callback.name === name) callback.callback(value);
      });
      agentState.onAction && agentState.onAction(name, value);
    };
    switch (event.data.type) {
      case "action":
        if (!event.data.payload || !event.data.payload.name) return false;
        const action = parseAction(event.data.payload);
        handleAction(action.name, action.value);
        break;
      case "actions":
        if (!event.data.payload || !event.data.payload.length) return false;
        const actions = parseActions(event.data.payload);
        if (!actions.length) return false;
        agentState.onActions && agentState.onActions(actions);
        actions.forEach(({ name, value }) => {
          handleAction(name, value);
        });
        break;
      case "onBeforeNewConversation":
        break;
      case "rendered":
        // Check the options
        let childOptions = event.data.payload;
        ["margin", "radius", "height", "width", "zIndex"].forEach((option) => {
          if (
            option in childOptions &&
            childOptions[option] !== null &&
            !isNaN(childOptions[option])
          )
            agentState[option] = parseInt(childOptions[option]);
        });
        agentState.rendered = true;
        agentState.onRenderedCallback && agentState.onRenderedCallback();
        agentState.webhookAccessToken &&
          setWebhookAccessToken(agentState.webhookAccessToken);
        agentState.metadata && setMetadata(agentState.metadata);
        finalizeRender();
        break;
      default:
      // Do nothing
    }
  });
  const handleResponsive = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width === agentState.windowWidth && height === agentState.windowHeight)
      return;
    agentState.windowWidth = width;
    agentState.windowHeight = height;
    // If it is a standard window, call restore to make sure it fits in the viewport
    agentState.rendered &&
      agentState.windowState === WINDOW_STATE_NONE &&
      restore({ resetPosition: false });
  };
  window.addEventListener("resize", handleResponsive);
  window.addEventListener("DOMContentLoaded", handleResponsive);
  const addStyles = (element, styles) =>
    Object.keys(styles).forEach(
      (style) => (element.style[style] = styles[style])
    );
  const stopEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleMouseDown = (e) => {
    // Do not allow dragging in fullscreen or when collapsed to FAB
    if (agentState.windowState === WINDOW_STATE_FULLSCREEN) return;
    if (
      agentState.windowState === WINDOW_STATE_COLLAPSED &&
      agentState.collapsedType === COLLAPSED_TYPE_FAB
    )
      return;
    stopEvents(e);
    let clientX = e.clientX;
    let clientY = e.clientY;
    // let height =
    //   agentState.windowState === WINDOW_STATE_COLLAPSED
    //     ? CHATBOT_COLLAPSED_HEIGHT
    //     : agentState.height;
    let height = wrapper.offsetHeight;
    let width = wrapper.offsetWidth;
    let margin = agentState.margin;
    iframe.style.pointerEvents = "none";
    handle.onmousedown = null;
    const handleMouseMove = (e) => {
      stopEvents(e);
      let top = wrapper.offsetTop - (clientY - e.clientY);
      let left = wrapper.offsetLeft - (clientX - e.clientX);
      clientX = e.clientX;
      clientY = e.clientY;
      if (top < margin) top = margin;
      if (left < margin) left = margin;
      let snapRight = false;
      let snapBottom = false;
      if (left + width >= window.innerWidth - margin) {
        left = window.innerWidth - width - margin;
        snapRight = true;
      }
      if (top + height >= window.innerHeight - margin) {
        top = window.innerHeight - height - margin;
        snapBottom = true;
      }
      if (snapRight && snapBottom) {
        addStyles(wrapper, {
          bottom: `${margin}px`,
          right: `${margin}px`,
          top: null,
          left: null,
        });
      } else {
        addStyles(wrapper, {
          top: `${top}px`,
          left: `${left}px`,
          bottom: null,
          right: null,
        });
      }
    };
    const handleMouseUp = (e) => {
      stopEvents(e);
      dragContainer.removeEventListener("mouseup", handleMouseUp);
      dragContainer.removeEventListener("mousemove", handleMouseMove);
      dragContainer.removeEventListener("mouseleave", handleMouseUp);
      handle.onmousedown = handleMouseDown;
      iframe.style.pointerEvents = "auto";
    };
    dragContainer.addEventListener("mouseup", handleMouseUp);
    dragContainer.addEventListener("mousemove", handleMouseMove);
    dragContainer.addEventListener("mouseleave", handleMouseUp);
    e.preventDefault;
  };
  const defaultBoxShadow =
    "0px 1.5px 5px 0px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12), 0px 8px 10px 1px rgba(0,0,0,0.20)";
  const collapse = () => {
    const collapedLayout = layout.collapsed[agentState.collapsedType];
    motionFadeIn();
    switch (agentState.collapsedType) {
      case COLLAPSED_TYPE_FAB:
        addStyles(wrapper, {
          height: `${collapedLayout.height}px`,
          width: `${collapedLayout.width}px`,
          borderRadius: `${collapedLayout.borderRadius}px`,
          bottom: `${agentState.margin}px`,
          right: `${agentState.margin}px`,
          top: null,
          left: null,
        });
        showCollapseFabButton();
        break;
      default: // COLLAPSED_TYPE_MINIMIZED
        addStyles(wrapper, {
          height: `${collapedLayout.height}px`,
          width: `${agentState.width}px`,
          bottom: `${agentState.margin}px`,
          right: `${agentState.margin}px`,
          top: null,
          left: null,
        });
    }
    addStyles(wrapper, {
      boxShadow:
        "0px 1.5px 5px 0px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12), 0px 8px 10px 1px rgba(0,0,0,0.20)",
    });
    updateWindowState(WINDOW_STATE_COLLAPSED);
  };
  const restore = (options = {}) => {
    const { resetPosition = true } = options;
    if (resetPosition) {
      addStyles(wrapper, {
        bottom: `${agentState.margin}px`,
        right: `${agentState.margin}px`,
        top: null,
        left: null,
      });
    }
    let { height, width, margin } = agentState;
    let { innerHeight, innerWidth } = window;

    // Check if ancor is top/left or bottom/right
    const anchorPosition =
      wrapper.style.bottom && wrapper.style.right ? "bottom-right" : "top-left";
    switch (anchorPosition) {
      case "top-left":
        // For top position you can use the height directly
        height = agentState.height;
        width = agentState.width;
        const { offsetTop, offsetLeft } = wrapper;

        // Check if it fits in the viewport
        let updateTopLeft = false;
        let top = offsetTop;
        let left = offsetLeft;
        if (offsetTop + height + margin > innerHeight) {
          top = innerHeight - height - margin;
          if (top < margin) top = margin;
          updateTopLeft = true;
        }
        if (offsetLeft + width + margin > innerWidth) {
          left = innerWidth - width - margin;
          if (left < margin) left = margin;
          updateTopLeft = true;
        }
        if (updateTopLeft) {
          // Check for snap
          if (
            top + height + margin >= innerHeight &&
            left + width + margin >= innerWidth
          )
            return addStyles(wrapper, {
              bottom: `${margin}px`,
              right: `${margin}px`,
              top: null,
              left: null,
            });
          else
            addStyles(wrapper, {
              bottom: null,
              right: null,
              top: `${top}px`,
              left: `${left}px`,
            });
        }
        if (height + margin * 2 > innerHeight)
          height = innerHeight - margin * 2;
        if (width + margin * 2 > innerWidth) width = innerWidth - margin * 2;
        break;
      case "bottom-right":
        if (height + margin * 2 > innerHeight)
          height = innerHeight - margin * 2;
        if (width + margin * 2 > innerWidth) width = innerWidth - margin * 2;
        break;
      default:
      // Do nothing
    }
    addStyles(wrapper, {
      height: `${height}px`,
      width: `${width}px`,
      boxShadow: defaultBoxShadow,
    });
    if (resetPosition) motionFadeIn();
    // wrapper.animate(
    //   [
    //     { opacity: 0, transform: "scale(0.92)" },
    //     { opacity: 1, transform: "scale(1)" },
    //   ],
    //   {
    //     duration: 300,
    //     easing: "cubic-bezier(0.2, 0, 0, 1)", // Material easing
    //     fill: "forwards",
    //   }
    // );
    hideCollapseFabButton();
    updateWindowState(WINDOW_STATE_NONE);
  };
  const fullscreen = () => {
    wrapper.style.width = `auto`;
    wrapper.style.height = `auto`;
    wrapper.style.width = `auto`;
    wrapper.style.height = `auto`;
    wrapper.style.top = `${agentState.margin}px`;
    wrapper.style.left = `${agentState.margin}px`;
    wrapper.style.bottom = `${agentState.margin}px`;
    wrapper.style.right = `${agentState.margin}px`;
    wrapper.style.boxShadow = defaultBoxShadow;
    // wrapper.style.borderRadius = "0px";
    // iframe.style.borderRadius = "0px";
    hideCollapseFabButton();
    updateWindowState(WINDOW_STATE_FULLSCREEN);
  };
  const showCollapseFabButton = () => {
    if (agentState.collapsedType === COLLAPSED_TYPE_FAB)
      fabButton.style.display = "block";
    else fabButton.style.display = "none";
  };
  const hideCollapseFabButton = () => {
    fabButton.style.display = "none";
  };
  const setWebhookAccessToken = (webhookAccessToken) => {
    agentState.webhookAccessToken = webhookAccessToken;
    if (!agentState.rendered) return;
    iframe.contentWindow.postMessage(
      {
        source: "nventr-agent",
        type: "webhookAccessToken",
        payload: webhookAccessToken,
      },
      "*"
    );
  };
  const setConversationUuid = (conversationUuid) => {
    agentState.setConversationUuid = conversationUuid;
    if (!agentState.rendered) return;
    iframe.contentWindow.postMessage(
      {
        source: "nventr-agent",
        type: "conversationUuid",
        payload: conversationUuid,
      },
      "*"
    );
  };
  const setMetadata = (metadata) => {
    agentState.metadata = metadata;
    if (!agentState.rendered) return;
    iframe.contentWindow.postMessage(
      {
        source: "nventr-agent",
        type: "metadata",
        payload: metadata,
      },
      "*"
    );
  };
  const updateWindowState = (windowState) => {
    agentState.windowState = windowState;
    iframe.contentWindow.postMessage(
      {
        source: "nventr-agent",
        type: "windowState",
        payload: windowState,
      },
      "*"
    );
  };
  const handleCollapseButtonClick = () => {
    agentState.windowState =
      agentState.windowState === WINDOW_STATE_COLLAPSED
        ? WINDOW_STATE_NONE
        : WINDOW_STATE_COLLAPSED;

    switch (agentState.windowState) {
      case WINDOW_STATE_COLLAPSED:
        collapse();
        break;
      default:
        restore();
        break;
    }
  };
  const handleFullscreenButtonClick = () => {
    agentState.windowState =
      agentState.windowState === WINDOW_STATE_FULLSCREEN
        ? WINDOW_STATE_NONE
        : WINDOW_STATE_FULLSCREEN;

    switch (agentState.windowState) {
      case WINDOW_STATE_FULLSCREEN:
        fullscreen();
        break;
      default:
        restore();
        break;
    }
  };
  const motionFadeIn = ({ duration = 800 } = {}) => {
    wrapper.animate(
      [
        { opacity: 0, transform: "scale(0.92)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.2, 0, 0, 1)", // Material easing
        fill: "forwards",
      }
    );
  };
  const fadeIn = ({ options = {} }) => {
    const duration = options.duration || 800;
    wrapper.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: duration,
      easing: "linear",
      fill: "forwards",
    });
  };
  const show = () => {
    if (agentState.visible) return;
    wrapper.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 800,
      easing: "linear",
      fill: "forwards",
    });
    agentState.visible = true;
  };
  const hide = () => {
    if (!agentState.visible) return;
    wrapper.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 800,
      easing: "linear",
      fill: "forwards",
    });
    agentState.visible = false;
  };
  const remove = () => {
    wrapper.getAnimations().forEach((animation) => animation.cancel());
    wrapper.remove();
    agentState.rendered = false;
    agentState.visible = false;
  };
  const finalizeRender = () => {
    addStyles(wrapper, {
      bottom: `${agentState.margin}px`,
      right: `${agentState.margin}px`,
      borderRadius: `${agentState.radius}px`,
      height: `${agentState.height}px`,
      width: `${agentState.width}px`,
      "z-index": agentState.zIndex,
    });
    switch (agentState.windowState) {
      case WINDOW_STATE_COLLAPSED:
        collapse();
        break;
      case WINDOW_STATE_FULLSCREEN:
        fullscreen();
        break;
      default:
      // do nothing
    }
    show();
  };
  const getOptionsByUrl = () => {
    const script = document.getElementById("nventr-agent");
    if (!script) return {};
    const url = new URL(script.src);
    const parseParamValue = (param, defaultValue) => {
      let ret = false;
      if (url.searchParams.has(param)) {
        const paramValue = url.searchParams.get(param);
        switch (paramValue) {
          case "":
          case "1":
          case "true":
            ret = true;
            break;
          case "false":
          case "0":
            ret = false;
            break;
          default:
            if (defaultValue === null) ret = paramValue;
        }
        if (url.searchParams.get(param) === "") ret = true;
      } else ret = defaultValue;
      return ret;
    };
    return {
      id: parseParamValue("id", null),
      dev: parseParamValue("dev", false),
      uat: parseParamValue("uat", false),
      fullscreen: parseParamValue("fullscreen", false),
      collapse: parseParamValue("collapse", false),
      render: parseParamValue("render", true),
      margin: parseParamValue("margin", null),
      zIndex: parseParamValue("zIndex", null),
      radius: parseParamValue("radius", null),
      theme: parseParamValue("theme", null),
      conversationUuid: parseParamValue("conversationUuid", null),
    };
  };
  const render = (options = {}) => {
    // Parse the script source to get the query params using id nventr-agent
    const dev = options.dev || false;
    const uat = options.uat || false;

    const agentAccessKey = options.id || options.agentAccessKey;
    if (!agentAccessKey) {
      console.warn(
        "Nventr Agent warning. No agent access key provided. Please add the id parameter or use nventrAgent.render({ id: [AGENT ACCESS KEY] })."
      );
      return false;
    }
    remove();

    // Set the options
    if (options.onRendered) agentState.onRenderedCallback = options.onRendered;
    if (options.webhookAccessToken)
      agentState.webhookAccessToken = options.webhookAccessToken;
    if (options.metadata) agentState.metadata = options.metadata;
    if (options.onAction) agentState.onAction = options.onAction;
    if (options.onActions) agentState.onActions = options.onActions;
    if (options.margin) agentState.margin = options.margin;
    if (options.radius) agentState.radius = options.radius;
    if (options.height) agentState.height = options.height;
    if (options.width) agentState.width = options.width;
    if (options.zIndex) agentState.zIndex = options.zIndex;
    if (options.conversationUuid)
      agentState.conversationUuid = options.conversationUuid;

    // Create the wrapper
    // Make the wrapper id unique
    wrapper.id = `nventrAgentWrapper_${Date.now()}`;
    addStyles(wrapper, {
      ...styles.wrapper,
      bottom: `${agentState.margin}px`,
      right: `${agentState.margin}px`,
      borderRadius: `${agentState.radius}px`,
      height: `${agentState.height}px`,
      width: `${agentState.width}px`,
    });
    // Create the draggable handle
    addStyles(handle, {
      ...styles.handle,
      width: `${agentState.width - 64}px`,
    });
    handle.onmousedown = handleMouseDown;
    // Create the collapse button
    addStyles(collapseButton, styles.collapseButton);
    collapseButton.onclick = handleCollapseButtonClick;
    // Create the fullscreen button
    addStyles(fullscreenButton, styles.fullscreenButton);
    fullscreenButton.onclick = handleFullscreenButtonClick;
    // Create the fab button
    addStyles(fabButton, {
      ...styles.fabButton,
      display: "none",
    });
    fabButton.onclick = handleCollapseButtonClick;
    // Create the iframe
    addStyles(iframe, {
      ...styles.iframe,
      borderRadius: `${agentState.radius}px`,
    });
    const iframeQueryParams = [];
    if (options.theme) iframeQueryParams.push(`theme=${options.theme}`);
    if (options.radius) iframeQueryParams.push(`radius=${options.radius}`);
    if (options.conversationUuid)
      iframeQueryParams.push(`conversationUuid=${options.conversationUuid}`);
    const iframeQueryStr = iframeQueryParams.length
      ? `&${iframeQueryParams.join("&")}`
      : "";
    let iframeSrc = `https://agent.inventr.ai?agentAccessKey=${agentAccessKey}${iframeQueryStr}`;
    if (uat)
      iframeSrc = `https://uat-agent.inventr.ai?agentAccessKey=${agentAccessKey}${iframeQueryStr}`;
    else if (dev)
      iframeSrc = `https://dev-agent.inventr.ai?agentAccessKey=${agentAccessKey}${iframeQueryStr}`;
    iframe.src = iframeSrc;
    iframe.allow = "microphone";
    iframe.allowusermedia = "true";
    wrapper.appendChild(iframe);
    wrapper.appendChild(handle);
    wrapper.appendChild(collapseButton);
    wrapper.appendChild(fullscreenButton);
    wrapper.appendChild(fabButton);
    document.body.appendChild(wrapper);

    if (options.collapse === true)
      agentState.windowState = WINDOW_STATE_COLLAPSED;
    else if (options.fullscreen === true)
      agentState.windowState = WINDOW_STATE_FULLSCREEN;
    return true;
  };
  const styles = {
    wrapper: {
      backgroundColor: "rgba(0, 0, 0, 0)",
      position: "fixed",
      zIndex: "10",
      opacity: "0",
      boxShadow: defaultBoxShadow,
      // boxShadow: "0px 1px 10px 1px rgba(0, 0, 0, .2)",
      borderWidth: "0px",
      overflow: "hidden",
    },
    handle: {
      cursor: "grab",
      position: "absolute",
      top: "0px",
      height: "32px",
      opacity: "0",
    },
    collapseButton: {
      cursor: "pointer",
      position: "absolute",
      top: "0px",
      right: "32px",
      height: "32px",
      width: "32px",
      opacity: "0",
    },
    fabButton: {
      "z-Index": "11",
      cursor: "pointer",
      position: "absolute",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
      opacity: "0",
    },
    fullscreenButton: {
      cursor: "pointer",
      position: "absolute",
      top: "0px",
      right: "0px",
      height: "32px",
      width: "32px",
      opacity: "0",
    },
    iframe: {
      position: "absolute",
      height: "100%",
      width: "100%",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
      borderRadius: "4px",
      borderWidth: "0px",
      overflow: "hidden",
    },
  };
  // Render the chatbot with the initial options
  const initialOptions = getOptionsByUrl();
  initialOptions.render && render(getOptionsByUrl());

  // Return an object with the public functions for controlling the agent
  return {
    render: (options) => {
      render(options);
    },
    setWebhookAccessToken: (webhookAccessToken) =>
      setWebhookAccessToken(webhookAccessToken),
    removeWebhookAccessToken: () => setWebhookAccessToken(null),
    setConversationUuid: (conversationUuid) =>
      setConversationUuid(conversationUuid),
    removeConversationUuid: () => setConversationUuid(null),
    addActionListener: (name, callback) => {
      const callbackItem = {
        name,
        callback,
      };
      actionListeners.push(callbackItem);
      // iframe.contentWindow.postMessage(
      //   {
      //     type: "actionCallback",
      //     payload: {
      //       name,
      //       value,
      //     },
      //   },
      //   "*"
      // );
      return {
        remove: () => {
          const index = actionListeners.indexOf(callbackItem);
          actionListeners.splice(index, 1);
        },
      };
    },
    onAction: (callback) => {
      agentState.onAction = callback;
    },
    onActions: (callback) => {
      agentState.onActions = callback;
    },
    onRendered: (callback) => {
      agentState.onRenderedCallback = callback;
      agentState.rendered && agentState.onRenderedCallback();
    },
    restore: () => restore(),
    collapse: () => collapse(),
    fullscreen: () => fullscreen(),
    show: () => show(),
    hide: () => hide(),
    margin: (margin) => {
      agentState.margin = margin;
    },
    radius: (radius) => {
      agentState.radius = radius;
    },
    theme: (theme) => {
      agentState.theme = theme;
    },
    remove: () => remove(),
  };
}
const nventrAgent = window.nventrAgent || init();
window.nventrAgent = nventrAgent;
window.inventrAgent = nventrAgent;
export default nventrAgent;