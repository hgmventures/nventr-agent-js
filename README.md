# nventr-agent.js

This JavaScript module is responsible for managing the Nventr agent.

## Including the agent in your HTML

To include the agent in your HTML, use a script tag. The script tag must have an `id` of "nventr-agent".

Example:

```html
<!-- Including the agent with an id -->
<script
  id="nventr-agent"
  src="https://agent.inventr.ai/nventr-agent.js?id=yourid"
></script>
```

In this example, the `id` is included as a query parameter in the URL. When the script is loaded, the agent will use this `id` for its operations.

If you want to include the agent but not render it immediately, you can set the `render` parameter to `false`:

```html
<!-- Including the agent with render=false and no id -->
<script
  id="nventr-agent"
  src="https://agent.inventr.ai/nventr-agent.js?render=false"
></script>
```

Then, you can use JavaScript to render the agent with an `id` when needed:

```javascript
// Render the agent with an id
window.nventrAgent.render({
  id: "yourid",
});
```

### Waiting for the Agent Script to Load

To ensure that the `window.nventrAgent` object is available before using it, you can wait for the script to load by listening to the `load` event of the script tag:

```html
<!-- Including the agent script -->
<script
  id="nventr-agent"
  src="https://agent.inventr.ai/nventr-agent.js?id=yourid"
></script>

<script>
  // Wait for the agent script to load
  document
    .getElementById("nventr-agent")
    .addEventListener("load", function () {
      // Now you can safely use window.nventrAgent
      window.nventrAgent.render({
        id: "yourid",
      });
    });
</script>
```

#### Explanation

- **Script Tag**: The script tag includes the agent script with an `id` of `nventr-agent`.
- **Load Event Listener**: The `load` event listener waits for the script to fully load before using `window.nventrAgent`.
- **Render Method**: The `render` method is called inside the `load` event listener to ensure that the agent is rendered only after the script is loaded.

Sure, let's update the example to move the `render` call to the end and remove the `render: true` option.

Example JavaScript File

md%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A41%2C%22character%22%3A109%7D%7D%5D%2C%22a9b1b750-f651-4065-8eee-c7a6ae1dbc75%22%5D "Go to definition") event listener to ensure that the agent is rendered only after the script is loaded.

## Including the Agent with NPM

To use the `@nventr.ai/nventr-agent` package in an ES6 JavaScript file, follow these steps:

1. **Install the Package**:
   First, ensure that the `@nventr.ai/nventr-agent` package is installed in your project.

   ```sh
   npm install @nventr.ai/nventr-agent
   ```

2. **Create a JavaScript File**:
   Create a JavaScript file, e.g., `example.js`, and include the following code:

   ```javascript
   // Import the nventrAgent from the @nventr.ai/nventr-agent package
   import nventrAgent from "@nventr.ai/nventr-agent";

   // Example of setting an action access token
   nventrAgent.setActionsAccessToken(btoa(JSON.stringify({ userId: "1" })));

   // Example of adding an action listener
   nventrAgent.addActionListener("DELETE_WORKSPACE", (value) => {
     console.log("Workspace deleted:", value);
   });

   // Example of adding another action listener
   nventrAgent.addActionListener("LIST_WORKSPACES", (workspaces) => {
     console.log("List of workspaces:", workspaces);
   });

   // Render the agent with your configuration
   nventrAgent.render({
     id: "yourid", // Replace 'yourid' with your actual ID
   });
   ```

### Explanation

- **Importing the Module**:

  ```javascript
  import nventrAgent from "@nventr.ai/nventr-agent";
  ```

  This line imports the `nventrAgent` from the `@nventr.ai/nventr-agent` package.

- **Setting an Action Access Token**:

  ```javascript
  nventrAgent.setActionsAccessToken(btoa(JSON.stringify({ userId: "1" })));
  ```

  This sets an action access token using a base64-encoded JSON string containing the `userId`.

- **Adding Action Listeners**:

  ```javascript
  nventrAgent.onAction((name, value) => {
    console.log("Handle action", name, value);
  });

  nventrAgent.onActions((actions) => {
    actions.forEach(({ name, value }) =>
      console.log("Check action", name, value)
    );
  });

  nventrAgent.addActionListener("DELETE_WORKSPACE", (value) => {
    console.log("Workspace deleted:", value);
  });

  nventrAgent.addActionListener("LIST_WORKSPACES", (workspaces) => {
    console.log("List of workspaces:", workspaces);
  });
  ```

  These lines add action listeners for the `DELETE_WORKSPACE` and `LIST_WORKSPACES` actions. The callbacks log the received values to the console.

- **Rendering the Agent**:
  ```javascript
  nventrAgent.render({
    id: "yourid",
  });
  ```
  This renders the `nventrAgent` with the specified configuration. Replace `'yourid'` with your actual ID.

### Summary

By following this example, you can use the `nventrAgent` from the `@nventr.ai/nventr-agent` package in a standard JavaScript file. This approach allows you to set an action access token, add action listeners, and render the agent with the correct configuration.

## Using the nventrAgent in JavaScript

The nventrAgent provides a set of methods that allow you to integrate and control the chatbot interface within your web application. This section describes how to use these methods to render the chatbot and handle action callbacks.

### Methods

### render(options)

Renders the chatbot interface. The `options` object can include:

- `fullscreen`: If true, the chatbot displays in fullscreen mode.
- `collapse`: If true, the chatbot starts in a collapsed state.
- `dev`: If true, the chatbot connects to the development server.
- `id` or `agentAccessKey`: The access key for the agent.

These options can also be passed as URL parameters when loading the agent:

```
https://agent.inventr.ai/nventr-agent.js?id=yourid&fullscreen&collapse&dev&render=false
```

In this URL, `fullscreen`, `collapse`, and `dev` are valueless parameters, which are treated as `true`. The `render` parameter is set to `false`, so the chatbot does not render immediately.

Example:

```javascript
window.nventrAgent.render({
  fullscreen: true,
  collapse: true,
  dev: true,
  id: "yourid",
});
```

### setActionsAccessToken(token)

Sets the action access token, which is used to authorize calls between the client and the agent based on the client's provided `actionsCallbackUrl`. The token should be something secure like a JWT so that authentication can be performed on the client server. The token is passed in the header `nventr-agent-actions-access-token` for `actionsCallbackUrl` requests.

#### Example Usage

```javascript
const exampleActionAccessToken = btoa(
  JSON.stringify({ userId: "1", clientId: "2" })
);
window.nventrAgent.setActionsAccessToken(exampleActionAccessToken);
```

#### Parameters

- **token**: The action access token, secure token (JWT or other) that can be used to validate action requests.

### addActionListener(actionName, callback)

Registers a callback function for a specific action. The callback is executed when the specified action is received.

#### Parameters

- `actionName` (string): The name of the action to listen for.
- `callback` (function): The function to call when the action is received. The callback receives the action data as its argument.

#### Example

```javascript
window.nventrAgent.addActionListener('actionName', function(data) {
  console.log('Action received:', data);
});
```

### onAction(callback)

Registers a callback function for all actions. The callback is executed when any action is received. The callback receives the action name and value as its arguments.

#### Parameters

- [`callback`] (function): The function to call when an action is received. The callback receives the action name and value as its arguments.

#### Example

```javascript
window.nventrAgent.onAction((name, value) => {
  console.log('Action received:', name, value);
});
```

### onActions(callback)

Registers a callback function for multiple actions. The callback is executed when any of the specified actions are received. The callback receives the action name and data as its arguments.

#### Parameters

- [`callback`] (function): The function to call when an action is received. The callback receives the action name and data as its arguments.

#### Example

```javascript
window.nventrAgent.onActions((actions) => {
  actions.forEach(({ name, value }) => {
    console.log('Action received:', name, value);
  });
});
```

#### ActionsCallbackUrl Express Example

You can set up an Express server to handle the `actionsCallbackUrl` and process multiple actions received in `data.actions` as an array.

Example:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/actions', async (req, res) => {
  const actions = req.body.actions;
  const tokenVals = {}; // Assume tokenVals is obtained from the request headers or other means
  const ret = { success: false, actions: [] };

  for (let action of actions) {
    const { name, value } = action;

    switch (name) {
      case "LIST_WORKSPACES":
        // Get the list of workspaces
        if (!checkUserAuth(tokenVals.userId, "workspace", "view"))
          return res.status(401).send("Unauthorized");
        ret.success = true;
        ret.actions.push({
          name,
          value: await fetchWorkspaces(
            { userIds: tokenVals.userId },
            { fields: ["id", "name"] }
          ),
        });
        break;
      case "GET_WORKSPACE":
        // Get the workspace details
        if (!checkUserAuth(tokenVals.userId, "workspace", "view"))
          return res.status(401).send("Unauthorized");
        ret.success = true;
        ret.value = await fetchWorkspace(
          { id: value.id, userIds: tokenVals.userId },
          { fields: ["id", "name", "description", "active"] }
        );
        break;
      case "UPDATE_WORKSPACE":
        // Update the workspace
        if (!checkUserAuth(tokenVals.userId, "workspace", "update"))
          return res.status(401).send("Unauthorized");
        ret.success = await updateWorkspace(
          { id: value.id, userIds: tokenVals.userId },
          {
            name: value.name,
            description: value.description,
            active: value.active,
          }
        );
        break;
      // Add more cases as needed
      default:
        console.log(`Unknown action: ${name}`);
    }
  }

  res.status(200).send(ret);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

In this example, the Express server listens for POST requests at the `/actions` endpoint. It processes each action received in the `data.actions` array and logs the action name and data. You can customize the handling logic for each action as needed.


### restore()

Restores the chatbot to its normal state from either fullscreen or collapsed state.

Example:

```javascript
window.nventrAgent.restore();
```

### collapse()

Collapses the chatbot to a minimized state.

Example:

```javascript
window.nventrAgent.collapse();
```

### fullscreen()

Puts the chatbot into fullscreen mode.

Example:

```javascript
window.nventrAgent.fullscreen();
```

### remove()

Removes the chatbot interface from the document.

Example:

```javascript
window.nventrAgent.remove();
```

## Action callbacks

### How Action Callbacks Work with Nventr Agent

The Nventr Agent uses action callbacks to communicate with the web server and perform specific actions. The client provides an actionsCallbackUrl to the agent, which the agent calls to execute actions. The actions are authorized using a secure token, typically a JWT, which is supplied by the web app to the agent and passed in the header `Nventr-Agent-Action-Access-Token`.

Action callbacks to the client's server from the Nventr Agent give the ability to use chat or natural voice to control data in the application. This is set up with the actionsCallbackUrl for the agent. An action access token (JWT, for example) can be set by the client's web application. Actions can be used to authorize and/or manipulate data. A listener can be added to the client web application (`addActionListener`) to perform validated actions on the web application.

#### actionsCallbackUrl Express Example

This example demonstrates how to set up an Express route to handle action callbacks from the Nventr Agent. The route listens for POST requests at the specified `actionsCallbackUrl` and performs various actions based on the request data.

### Example Code

```javascript
const express = require("express");
const app = express();

// Add JSON body parser
app.use(express.json());

// Add the actionsCallbackUrl route
// Example actionsCallbackUrl: https://www.myapp.com/agent/actions
app.use("/agent/actions", async (req, res) => {
  // Get the actionAccessToken from the request headers
  // The token is supplied by the web app to the agent
  const actionAccessToken = req.headers["nventr-agent-actions-access-token"];
  const tokenVals = actionAccessToken ? decryptToken(actionAccessToken) : null;
  if (!tokenVals) return res.status(401).send("Invalid token");

  // Get the action name and value from the request body
  const { actions } = req.body;

  // Perform the action
  let ret = { success: false, actions: [] };
  // Loop through the actions
  for (let action of actions) {
    const { name, value } = action;

    switch (name) {
      case "LIST_WORKSPACES":
        // Get the list of workspaces
        if (!checkUserAuth(tokenVals.userId, "workspace", "view"))
          return res.status(401).send("Unauthorized");
        ret.success = true;
        ret.actions.push({
          name,
          value: await fetchWorkspaces(
            { userIds: tokenVals.userId },
            { fields: ["id", "name"] }
          ),
        });
        break;
      case "GET_WORKSPACE":
        // Get the workspace details
        if (!checkUserAuth(tokenVals.userId, "workspace", "view"))
          return res.status(401).send("Unauthorized");
        ret.success = true;
        ret.actions.push({
          name,
          value: await fetchWorkspace(
            { id: value.id, userIds: tokenVals.userId },
            { fields: ["id", "name", "description", "active"] }
          ),
        });
        break;
      case "UPDATE_WORKSPACE":
        // Update the workspace
        if (!checkUserAuth(tokenVals.userId, "workspace", "update"))
          return res.status(401).send("Unauthorized");
        ret.success = await updateWorkspace(
          { id: value.id, userIds: tokenVals.userId },
          {
            name: value.name,
            description: value.description,
            active: value.active,
          }
        );
        ret.actions.push({
          name,
          value: { name: value.name, id: value.id },
        });
        break;
      case "CREATE_WORKSPACE":
        // Create the workspace
        if (!checkUserAuth(tokenVals.userId, "workspace", "create"))
          return res.status(401).send("Unauthorized");
        const workspace = await createWorkspace({
          userIds: [tokenVals.userId],
          name: value.name,
          description: value.description,
          active: value.active,
        });
        ret.success = workspace ? true : false;
        ret.actions.push({
          name,
          value: { name: workspace.name, id: workspace.id },
        });
        break;
      case "DELETE_WORKSPACE":
        // Delete the workspace
        if (!checkUserAuth(tokenVals.userId, "workspace", "delete"))
          return res.status(401).send("Unauthorized");
        ret.success = await deleteWorkspace({
          id: value.id,
          userIds: tokenVals.userId,
        });
        ret.actions.push({
          name,
          value: { name: value.name, id: value.id },
        });
        break;
      default:
        return res.status(400).send("Invalid action name");
    }
  }

  // Return the response
  res.status(200).json(ret);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

### Explanation

1. **Route Setup**: The route `/agent/actions` is defined to handle POST requests. This is the `actionsCallbackUrl` that the Nventr Agent will call to perform actions.

2. **Token Extraction and Validation**:

   - The `actionAccessToken` is extracted from the request headers using the header name `nventr-agent-actions-access-token`.
   - The token is decrypted using the `decryptToken` function. If the token is invalid or missing, a `401 Unauthorized` response is sent.

3. **Action Handling**:

   - The action name and value are extracted from the request body.
   - A switch statement is used to handle different actions based on the `name` field.
   - For each action, the user's authorization is checked using the `checkUserAuth` function.
   - Depending on the action, different functions are called to perform the required operations (e.g., `fetchWorkspaces`, `fetchWorkspace`, `updateWorkspace`, `createWorkspace`, `deleteWorkspace`).

4. **Response**:
   - A response object `ret` is constructed with the result of the action.
   - The response is sent back to the client with a `200 OK` status and the result in JSON format.

### Actions Supported

- **LIST_WORKSPACES**: Retrieves a list of workspaces for the authenticated user.
- **GET_WORKSPACE**: Retrieves details of a specific workspace.
- **UPDATE_WORKSPACE**: Updates the details of a specific workspace.
- **CREATE_WORKSPACE**: Creates a new workspace.
- **DELETE_WORKSPACE**: Deletes a specific workspace.

### Security

- The `actionAccessToken` should be a secure token like a JWT, which is passed in the header `nventr-agent-actions-access-token`.
- The token is used to authenticate and authorize the actions performed by the client on the server.

This setup ensures that only authorized actions are performed and that the actions are securely authenticated using the provided token.
v
