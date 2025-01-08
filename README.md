# json-edit-react

<img width="60" alt="screenshot" src="image/logo192.png" style="float:left; margin-right: 1em;">

A [React](https://github.com/facebook/react) component for editing or viewing JSON/object data


## [Explore the Demo](https://carlosnz.github.io/json-edit-react/) <!-- omit in toc -->

![NPM Version](https://img.shields.io/npm/v/json-edit-react)
![GitHub License](https://img.shields.io/github/license/carlosnz/json-edit-react)
![NPM Downloads](https://img.shields.io/npm/dm/json-edit-react)

### Features include:

 - edit individual values, or whole objects as JSON text
 - fine-grained control over which elements can be edited, deleted, or added to
 - full [JSON Schema](https://json-schema.org/) validation (using 3rd-party validation library)
 - customisable UI, through simple, pre-defined [themes](#themes--styles), specific CSS overrides for UI components, or by targeting CSS classes
 - self-contained — rendered with plain HTML/CSS, so no dependance on external UI libraries
 - search/filter data by key, value or custom function
 - provide your own [custom component](#custom-nodes) to integrate specialised UI for certain data.
 - [localisable](#localisation) UI
 - **NEW!** [Drag-n-drop](#drag-n-drop) editing! (*experimental*)

<img width="392" alt="screenshot" src="image/screenshot.png">

> [!IMPORTANT]
> Breaking changes:
> - **Version 1.19.0** has a change to the `theme` input. Built-in themes must now
> be imported separately and passed in, rather than just naming the theme as a
> string. This is better for tree-shaking, so unused themes won't be bundled
> with your build. See [Themes & Styles](#themes--styles)
> - **Version 1.14.0** has a change which recommends you provide a `setData` prop
> and not use `onUpdate` for updating your data externally. See [Managing
> state](#managing-state).

## Contents  <!-- omit in toc -->
- [Installation](#installation)
- [Implementation](#implementation)
- [Usage](#usage)
- [Props overview](#props-overview)
- [Managing state](#managing-state)
- [Update functions](#update-functions)
  - [OnChange function](#onchange-function)
  - [OnError function](#onerror-function)
  - [Copy function](#copy-function)
  - [Custom Buttons](#custom-buttons)
- [Filter functions](#filter-functions)
  - [Examples](#examples-1)
  - [JSON Schema validation](#json-schema-validation)
  - [Drag-n-drop](#drag-n-drop)
- [Search/Filtering](#searchfiltering)
- [Themes \& Styles](#themes--styles)
  - [Fragments](#fragments)
  - [A note about sizing and scaling](#a-note-about-sizing-and-scaling)
  - [Icons](#icons)
- [Localisation](#localisation)
- [Custom Nodes](#custom-nodes)
  - [Active hyperlinks](#active-hyperlinks)
  - [Custom Collection nodes](#custom-collection-nodes)
- [Custom Text](#custom-text)
- [Keyboard customisation](#keyboard-customisation)
- [Undo functionality](#undo-functionality)
- [Exported helpers](#exported-helpers)
  - [Functions \& Components](#functions--components)
  - [Types](#types)
- [Issues, bugs, suggestions?](#issues-bugs-suggestions)
- [Roadmap](#roadmap)
- [Inspiration](#inspiration)
- [Changelog](#changelog)


## Installation

`npm i json-edit-react`

or 

`yarn add json-edit-react`

## Implementation

```jsx
import { JsonEditor } from 'json-edit-react'

// In your React component:
return 
  <JsonEditor
    data={ jsonData }
    setData={ setJsonData } // optional
    { ...otherProps } />
```

## Usage

**(for end user)**

It's pretty self explanatory (click the "edit" icon to edit, etc.), but there are a few not-so-obvious ways of interacting with the editor:

- Double-click a value (or a key) to edit it
- When editing a string, use `Cmd/Ctrl/Shift-Enter` to add a new line (`Enter` submits the value)
- It's the opposite when editing a full object/array node (which you do by clicking "edit" on an object or array value) — `Enter` for new line, and `Cmd/Ctrl/Shift-Enter` for submit
- `Escape` to cancel editing
- When clicking the "clipboard" icon, holding down `Cmd/Ctrl` will copy the *path* to the selected node rather than its value
- When opening/closing a node, hold down "Alt/Option" to open/close *all* child nodes at once
- For Number inputs, arrow-up and down keys will increment/decrement the value
- Drag and drop items to change the structure or modify display order
- JSON text input can accept "looser" input, if an additional JSON parsing method is provided (e.g. [JSON5](https://json5.org/)). See `jsonParse` prop.

## Props overview

The only *required* value is `data` (although you will need to provide a `setData` method to update your data).

| prop                    | type                                          | default                                   | description                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | --------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                  | `object\|array`                               |                                           | The data to be displayed / edited                                                                                                                                                                                                                                                                                                                    |
| `setData`               | `object\|array => void`                       |                                           | Method to update your `data` object. See [Managing state](#managing-state) below for additional notes.                                                                                                                                                                                                                                               |
| `rootName`              | `string`                                      | `"data"`                                  | A name to display in the editor as the root of the data object.                                                                                                                                                                                                                                                                                      |
| `onUpdate`              | `UpdateFunction`                              |                                           | A function to run whenever a value is **updated** (edit, delete *or* add) in the editor. See [Update functions](#update-functions).                                                                                                                                                                                                                  |
| `onEdit`                | `UpdateFunction`                              |                                           | A function to run whenever a value is **edited**.                                                                                                                                                                                                                                                                                                    |
| `onDelete`              | `UpdateFunction`                              |                                           | A function to run whenever a value is **deleted**.                                                                                                                                                                                                                                                                                                   |
| `onAdd`                 | `UpdateFunction`                              |                                           | A function to run whenever a new property is **added**.                                                                                                                                                                                                                                                                                              |
| `onChange`              | `OnChangeFunction`                            |                                           | A function to modify/constrain user input as they type -- see [OnChange functions](#onchange-function).                                                                                                                                                                                                                                              |
| `onError`               | `OnErrorFunction`                             |                                           | A function to run whenever the component reports an error -- see [OnErrorFunction](#onerror-function).                                                                                                                                                                                                                                               |
| `showErrorMessages`     | `boolean `                                    | `true`                                    | Whether or not the component should display its own error messages (you'd probably only want to disable this if you provided your own `onError` function)                                                                                                                                                                                            |
| `enableClipboard`       | `boolean\|CopyFunction`                       | `true`                                    | Whether or not to enable the "Copy to clipboard" button in the UI. If a function is provided, `true` is assumed and this function will be run whenever an item is copied.                                                                                                                                                                            |
| `indent`                | `number`                                      | `3`                                       | Specify the amount of indentation for each level of nesting in the displayed data.                                                                                                                                                                                                                                                                   |
| `collapse`              | `boolean\|number\|FilterFunction`             | `false`                                   | Defines which nodes of the JSON tree will be displayed "opened" in the UI on load. If `boolean`, it'll be either all or none. A `number` specifies a nesting depth after which nodes will be closed. For more fine control a function can be provided — see [Filter functions](#filter-functions).                                                   |
| `collapseAnimationTime` | `number`                                      | `300`                                     | Time (in milliseconds) for the transition animation when collapsing collection nodes.                                                                                                                                                                                                                                                                |
| `restrictEdit`          | `boolean\|FilterFunction`                     | `false`                                   | If `true`, no editing is permitted. A function can be provided for more specificity — see [Filter functions](#filter-functions)                                                                                                                                                                                                                      |
| `restrictDelete`        | `boolean\|FilterFunction`                     | `false`                                   | As with `restrictEdit` but for deletion                                                                                                                                                                                                                                                                                                              |
| `restrictAdd`           | `boolean\|FilterFunction`                     | `false`                                   | As with `restrictEdit` but for adding new properties                                                                                                                                                                                                                                                                                                 |
| `restrictTypeSelection` | `boolean\|DataType[]\|TypeFilterFunction`     | `true`                                    | For restricting the data types the user can select. Can be a list of data types (e.g. `[ 'string', 'number', 'boolean', 'array', 'object', 'null' ]`) or a boolean. A function can be provided -- it should take the same input as the above `FilterFunction`s, but output should be `boolean \| DataType[]`.                                        |
| `restrictDrag`          | `boolean\|FilterFunction`                     | `true`                                    | Set to `false` to enable drag and drop functionality. See [Drag-n-drop](#drag-n-drop)                                                                                                                                                                                                                                                                |
| `searchText`            | `string`                                      | `undefined`                               | Data visibility will be filtered by matching against value, using the method defined below in `searchFilter`                                                                                                                                                                                                                                         |
| `searchFilter`          | `"key"\|"value"\|"all"\|SearchFilterFunction` | `undefined`                               | Define how `searchText` should be matched to filter the visible items. See [Search/Filtering](#searchfiltering)                                                                                                                                                                                                                                      |
| `searchDebounceTime`    | `number`                                      | `350`                                     | Debounce time when `searchText` changes                                                                                                                                                                                                                                                                                                              |
| `keySort`               | `boolean\|CompareFunction`                    | `false`                                   | If `true`, object keys will be ordered (using default JS `.sort()`). A [compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) can also be provided to define sorting behaviour.                                                                                                             |
| `showArrayIndices`      | `boolean`                                     | `true`                                    | Whether or not to display the index (as a property key) for array elements.                                                                                                                                                                                                                                                                          |
| `showStringQuotes`      | `boolean`                                     | `true`                                    | Whether or not to display string values in "quotes".                                                                                                                                                                                                                                                                                                 |
| `showCollectionCount`   | `boolean\|"when-closed"`                      | `true`                                    | Whether or not to display the number of items in each collection (object or array).                                                                                                                                                                                                                                                                  |
| `defaultValue`          | `any\|DefaultValueFilterFunction`             | `null`                                    | When a new property is added, it is initialised with this value. A [function can be provided](#filter-functions) with the almost the same input as the `FilterFunction`s, but should output a value. This allows a different default value to be used depending on the data state (e.g. default for top level is an object, but a string elsewhere.) |
| `stringTruncate`        | `number`                                      | `250`                                     | String values longer than this many characters will be displayed truncated (with `...`). The full string will always be visible when editing.                                                                                                                                                                                                        |
| `translations`          | `LocalisedStrings` object                     | `{ }`                                     | UI strings (such as error messages) can be translated by passing an object containing localised string values (there are only a few). See [Localisation](#localisation)                                                                                                                                                                              |
| `theme`                 | `ThemeInput`                                  | `default`                                 | Either one of the built-in themes (imported separately), or an object specifying some or all theme properties. See [Themes](#themes--styles).                                                                                                                                                                                                        |
| `className`             | `string`                                      |                                           | Name of a CSS class to apply to the component. In most cases, specifying `theme` properties will be more straightforward.                                                                                                                                                                                                                            |
| `id`                    | `string`                                      |                                           | Name for the HTML `id` attribute on the main component container.                                                                                                                                                                                                                                                                                    |
| `icons`                 | `{[iconName]: JSX.Element, ... }`             | `{ }`                                     | Replace the built-in icons by specifying them here. See [Themes](#themes--styles).                                                                                                                                                                                                                                                                   |  |
| `minWidth`              | `number\|string` (CSS value)                  | `250`                                     | Minimum width for the editor container.                                                                                                                                                                                                                                                                                                              |
| `maxWidth`              | `number\|string` (CSS value)                  | `600`                                     | Maximum width for the editor container.                                                                                                                                                                                                                                                                                                              |
| `rootFontSize`          | `number\|string` (CSS value)                  | `16px`                                    | The "base" font size from which all other sizings are derived (in `em`s). By changing this you will scale the entire component. container.                                                                                                                                                                                                           |
| `customNodeDefinitions` | `CustomNodeDefinition[]`                      |                                           | You can provide customised components to override specific nodes in the data tree, according to a condition function. See see [Custom nodes](#custom-nodes) for more detail. (A simple custom component to turn url strings into active links is provided in the main package  -- see [here](#active-hyperlinks))                                    |
| `customText`            | `CustomTextDefinitions`                       |                                           | In addition to [localising the component](#localisation) text strings, you can also *dynamically* alter it, depending on the data. See [Custom Text](#custom-text) for more detail.                                                                                                                                                                  |
| `customButtons`         | `CustomButtonDefinition[]`                    | `[]`                                      | You can add your own buttons to the Edit Buttons panel if you'd like to be able to perform a custom operation on the data. See [Custom Buttons](#custom-buttons)                                                                                                                                                                                     |
| `jsonParse`             | `(input: string) => JsonData`                 | `JSON.parse`                              | When editing a block of JSON directly, you may wish to allow some "looser" input -- e.g. 'single quotes', trailing commas, or unquoted field names. In this case, you can provide a third-party JSON parsing method. I recommend [JSON5](https://json5.org/), which is what is used in the [Demo](https://carlosnz.github.io/json-edit-react/)       |
| `jsonStringify`         | `(data: JsonData) => string`                  | `(data) => JSON.stringify(data, null, 2)` | Similarly, you can override the default presentation of the JSON string when starting editing JSON. You can supply different formatting parameters to the native `JSON.stringify()`, or provide a third-party option, like the aforementioned JSON5.                                                                                                 |
| `errorMessageTimeout`   | `number`                                      | `2500`                                    | Time (in milliseconds) to display the error message in the UI.                                                                                                                                                                                                                                                                                       |  |
| `keyboardControls`      | `KeyboardControls`                            | As explained [above](#usage)              | Override some or all of the keyboard controls. See [Keyboard customisation](#keyboard-customisation) for details.                                                                                                                                                                                                                                    |  |
| `insertAtTop`           | `boolean\| "object \| "array"`                | `false`                                   | If `true`, inserts new values at the *top* rather than bottom. Can set the behaviour just for arrays or objects by setting to `"object"` or `"array"` respectively.                                                                                                                                                                                  |  |

## Managing state

It is recommended that you manage the `data` state yourself outside this component -- just pass in a `setData` method, which is called internally to update your `data`. However, this is not compulsory -- if you don't provide a `setData` method, the data will be managed internally, which would be fine if you're not doing anything with the data. The alternative is to use the [Update functions](#update-functions) to update your `data` externally, but this is not recommended except in special circumstances as you can run into issues keeping your data in sync with the internal state (which is what is displayed), as well as unnecessary re-renders. Update functions should be ideally be used only for implementing side effects, checking for errors, or mutating the data before setting it with `setData`.

## Update functions

A callback to be executed whenever a data update (edit, delete or add) occurs can be provided. You might wish to use this to update some external state, make an API call, modify the data before saving it, or [validate the data structure](#json-schema-validation) against a JSON schema. If you want the same function for all updates, then just the `onUpdate` prop is sufficient. However, should you require something different for editing, deletion and addition, then you can provide separate Update functions via the `onEdit`, `onDelete` and `onAdd` props.

The function will receive the following object as a parameter:

```js
{
    newData,      // data state after update
    currentData,  // data state before update 
    newValue,     // the new value of the property being updated
    currentValue, // the current value of the property being updated
    name,         // name of the property being updated
    path          // full path to the property being updated, as an array of property keys
                  // (e.g. [ "user", "friends", 1, "name" ] ) (equivalent to "user.friends[1].name")
}
```
The function can return nothing (in which case the data is updated normally), or a value to represent success/failure, error value, or modified data. The return value can be one of the following, and handled accordingly:
- `true` / `void` / `undefined`: data continues update as normal
- `false`: considers the update to be an error, so data is not updated (reverts to previous value), and a generic error message is displayed in the UI
- `string`: also considered an error, so no data update, but the UI error message will be your provided string
- `[ "value", <value> ]`: tells the component to use the returned `<value>` instead of the input data. You might use this to automatically modify user input -- for example, sorting an array, or inserting a timestamp field into an object.
- `[ "error", <value> ]`: same as `string`, but in the longer tuple format.

### OnChange function

Similar to the Update functions, the `onChange` function is executed as the user input changes. You can use this to restrict or constrain user input -- e.g. limiting numbers to positive values, or preventing line breaks in strings. The function *must* return a value in order to update the user input field, so if no changes are to made, just return it unmodified.

The input object is similar to the Update function input, but with no `newData` field (since this operation occurs before the data is updated).

#### Examples

- Restrict "age" inputs to positive values up to 100:  
  ```js
  // in <JsonEditor /> props
  onChange = ({ newValue, name }) => {
        if (name === "age" && newValue < 0) return 0;
        if (name === "age" && newValue > 100) return 100;
        return newValue
      }
  ```
- Only allow alphabetical or whitespace input for "name" field (including no line breaks):  
  ```js
  onChange = ({ newValue, name }) => {
      if (name === 'name' && typeof newValue === "string")
        return newValue.replace(/[^a-zA-Z\s]|\n|\r/gm, '');
      return newValue;
    }
  ```

### OnError function

Normally, the component will display simple error messages whenever an error condition is detected (e.g. invalid JSON input, duplicate keys, or custom errors returned by the [`onUpdate` functions)](#update-functions)). However, you can provide your own `onError` callback in order to implement your own error UI, or run additional side effects. (In the former case, you'd probably want to disable the `showErrorMessages` prop, too.) The input to the callback is similar to the other callbacks:

```js
{
    currentData,  // data state before update 
    currentValue, // the current value of the property being updated
    errorValue,   // the erroneous value that failed to update the property
    name,         // name of the property being updated
    path,         // full path to the property being updated, as an array of property keys
                  // (e.g. [ "user", "friends", 1, "name" ] ) (equivalent to "user.friends[1].name"),
    error: {
      code,       // one of 'UPDATE_ERROR' | 'DELETE_ERROR' | 'ADD_ERROR' | 'INVALID_JSON' | 'KEY_EXISTS'
      message     // the (localised) error message that would be displayed
    }
}
```
 (An example of a custom Error UI can be seen in the [Demo](#https://carlosnz.github.io/json-edit-react/?data=customNodes) with the "Custom Nodes" data set -- when you enter invalid JSON input a "Toast" notification is displayed instead of the normal component error message.)

### Copy function

A similar callback is executed whenever an item is copied to the clipboard (if passed to the `enableClipboard` prop), but with a different input parameter:

```js
    key         // name of the property being copied  
    path        // path to the property
    value       // the value copied to the clipboard
    type        // Either "path" or "value" depending on whether "Cmd/Ctrl" was pressed 
    stringValue // A nicely stringified version of `value`  
                // (i.e. what the clipboard actually receives)
```

Since there is very little user feedback when clicking "Copy", a good idea would be to present some kind of notification in this callback.

### Custom Buttons

In addition to the "Copy", "Edit" and "Delete" buttons that appear by each value, you can add your own buttons if you need to allow some custom operations on the data. Provide an array of button definitions in the `customButtons` prop, in the following definition structure:

```js
{
  Element: React.FC<{ nodeData: NodeData }>,
  onClick?: (nodeData: NodeData, e: React.MouseEvent) => void
}
```
Where `NodeData` is the same data structure received by the previous "Update Functions".

The `onClick` is optional -- don't provide it if you have your own `onClick` handler within your button component.

## Filter functions

You can control which nodes of the data structure can be edited, deleted, or added to, or have their data type changed, by passing Filter functions. These will be called on each property in the data and the attribute will be enforced depending on whether the function returns `true` or `false` (`true` means *cannot* be edited).

The function receives the following object:
```js
{
    key,   // name of the property
    path,  // path to the property (as an array of property keys)
    level, // depth of the property (with 0 being the root)
    index, // index of the node within its collection (based on display order)
    value, // value of the property
    size ,  // if a collection (object, array), the number of items (null for non-collections)
    parentData, // parent object containing the current node
    fullData // the full (overall) data object
    collapsed // whether or not the current node is in a
              // "collapsed" state (only for Collection nodes)
}
```

A Filter function is available for the `collapse` prop as well, so you can have your data appear with deeply-nested collections opened up, while collapsing everything else, for example.

For restricting data types, the (Type) filter function is slightly more sophisticated. The input is the same, but the output can be either a `boolean` (which would restrict the available types for a given node to either *all* or *none*), or an array of data types to be restricted to. The available values are:
- `"string"`
- `"number"`
- `"boolean"`
- `"null"`
- `"object"`
- `"array"`

There is no specific restriction function for editing object key names, but they must return `true` for *both* `restrictEdit` and `restrictDelete` (and `restrictAdd` for collections), since changing a key name is equivalent to deleting a property and adding a new one.

You can also set a dynamic default value by passing a filter function to the `defaultValue` prop -- the input is the same as the above, but also takes the new `key` value as its second parameter, so the new value can depend on the new key added.

Using all these restriction filters together can allow you to enforce a reasonably sophisticated data schema.

### Examples

- A good case would be ensure your root node is not directly editable:

```js
// in <JsonEditor /> props
restrictEdit = { ({ level }) => level === 0 }
```

- Don't let the `id` field be edited:

```js
restrictEdit = { ({ key }) => key === "id" }
// You'd probably want to include this in `restrictDelete` as well
```

- Only individual properties can be deleted, not objects or arrays:

```js
restrictDelete = { ({ size }) => size !== null }
```

- The only collections that can have new items added are the "address" object and the "users" array:
```js
restrictAdd = { ({ key }) => key !== "address" && key !== "users" }
// "Adding" is irrelevant for non-collection nodes
```

- Multiple type restrictions:
  - `string` values can only be changed to strings or objects (for nesting)
  - `null` is not allowed anywhere
  - `boolean` values must remain boolean
  - data nested below the "user" field can be any simple property (i.e. not objects or arrays), and doesn't have to follow the above rules (except no "null")
```js
restrictTypeSelection = { ({ path, value }) => {
  if (path.includes('user')) return ['string', 'number', 'boolean']
  if (typeof value === 'boolean') return false
  if (typeof value === 'string') return ['string', 'object']
  return ['string', 'number', 'boolean', 'array', 'object'] // no "null"
} }
```

### JSON Schema validation

As well as dynamically controlling *access* to the various edit tools as described above, it's possible to do full [JSON Schema](https://json-schema.org/) validation by creating an [Update Function](#update-functions) that passes the data to a 3rd-party schema validation library (e.g. [Ajv](https://ajv.js.org/)). This will then reject any invalid input, and display an error in the UI (or via a custom [onError](#onerror-function) function). You can see an example of this in the [Demo](https://carlosnz.github.io/json-edit-react/?data=jsonSchemaValidation) with the "JSON Schema Validation" data set (and the "Custom Nodes" data set). 

An example `onUpdate` validation function (using Ajv) could be something like this:

```js
import { JsonEditor } from 'json-edit-react'
import Ajv from 'ajv'
import schema from './my-json-schema.json'

const ajv = new Ajv()
const validate = ajv.compile(schema)

/// Etc....

// In the React component:
return 
  <JsonEditor
    data={ jsonData }
    onUpdate={ ({ newData }) => {
      const valid = validate(newData)
      if (!valid) {
        console.log('Errors', validate.errors)
        const errorMessage = validate.errors
          ?.map((error) => `${error.instancePath}${error.instancePath ? ': ' : ''}${error.message}`)
          .join('\n')
        // Send detailed error message to an external UI element, such as a "Toast" notification
         displayError({
          title: 'Not compliant with JSON Schema',
          description: errorMessage,
          status: 'error',
        })
        // This string returned to and displayed in json-edit-react UI
        return 'JSON Schema error'
      }
    }}
  { ...otherProps } />
```

### Drag-n-drop

> [!NOTE]
> *This is a new feature and should be considered "experimental". Please provide [feedback or suggestions](https://github.com/CarlosNZ/json-edit-react/issues) to help improve it.*

The `restrictDrag` property controls which items (if any) can be dragged into new positions. By default, this is *off*, so you must set `restrictDrag = false` to enable this functionality. Like the Edit restrictions above, this property can also take a Filter function for fine-grained control. There are a couple of additional considerations, though:

- Javascript does *not* guarantee object property order, so enabling this feature may yield unpredictable results. See [here](https://dev.to/frehner/the-order-of-js-object-keys-458d) for an explanation of how key ordering is handled. It is strongly advised that you only enable drag-and-drop functionality if:
  1. you're sure object keys will always be simple strings (i.e. not digits or non-standard characters)
  2. you're saving the data in a serialisation format that preserves key order. For example, storing in a Postgres database using the `jsonb` (binary JSON) type, key order is meaningless, so the next time the object is loaded, the keys will be listed alphabetically.
- The `restrictDrag` filter applies to the *source* element (i.e. the node being dragged), not the destination.
- To be draggable, the node must *also* be delete-able (via the `restrictDelete` prop), as dragging a node to a new destination is essentially just deleting it and adding it back elsewhere.
- Similarly, the destination collection must be editable in order to drop it in there. This means that, if you've gone to the trouble of configuring restrictive editing constraints using Filter functions, you can be confident that they can't be circumvented via drag-n-drop.

## Search/Filtering

The displayed data can be filtered based on search input from a user. The user input should be captured independently (we don't provide a UI here) and passed in with the `searchText` prop. This input is debounced internally (time can be set with the `searchDebounceTime` prop), so no need for that as well. The values that the `searchText` are tested against is specified with the `searchFilter` prop. By default (no `searchFilter` defined), it will match against the data *values* (with case-insensitive partial matching -- i.e. input "Ilb", will match value "Bilbo").

You can specify what should be matched by setting `searchFilter` to either `"key"` (match property names), `"value"` (the default described above), or `"all"` (match both properties and values). This should be enough for the majority of use cases, but you can specify your own `SearchFilterFunction`. The search function is the same signature as the above [FilterFunctions](#filter-functions) but takes one additional argument for the `searchText`, i.e.

```ts
( { key, path, level, value, ...etc }:FilterFunctionInput, searchText:string ) => boolean
```

There are two helper functions (`matchNode()` and `matchNodeKey()`) exported with the package that might make creating your search function easier (these are the functions used internally for the `"key"` and `"value"` matches described above). You can see what they do [here](https://github.com/CarlosNZ/json-edit-react/blob/574f2c1ba3e724c93ce8ab9cdba2fe8ebbbbf806/src/filterHelpers.ts#L64-L95).

An example custom search function can be seen in the [Demo](#https://carlosnz.github.io/json-edit-react/?data=jsonPlaceholder) with the "Client list" data set -- the search function matches by name and username, and makes the entire "Client" object visible when one of those matches, so it can be used to find a particular person and edit their specific details:

```js 
({ path, fullData }, searchText) => {
  // Matches *any* node that shares a path (i.e. a descendent) with a matching name/username
    if (path?.length >= 2) {
      const index = path?.[0]
      return (
        matchNode({ value: fullData[index].name }, searchText) ||
        matchNode({ value: fullData[index].username }, searchText)
      )
    } else return false
  }
```

## Themes & Styles

There is a small selection of built-in themes (as seen in the [Demo app](https://carlosnz.github.io/json-edit-react/)). In order to use one of these, just import it from the package and pass it as the theme prop:

```js
import { JsonEditor, githubDarkTheme } from 'json-edit-react'
// ...other imports

const MyApp = () => {
  const [ data, setData ] = useState({ one: 1, two: 2 })

  return <JsonEditor
    data={data}
    setData={setData}
    theme={githubDarkTheme}
    // other props...
    />
}
```

The following themes are available in the package (although realistically, these exist more to showcase the capabilities  — I'm open to better built-in themes, so feel free to [create an issue](https://github.com/CarlosNZ/json-edit-react/issues) with suggestions):
- `githubDarkTheme`
- `githubLightTheme`
- `monoDarkTheme`
- `monoLightTheme`
- `candyWrapperTheme`
- `psychedelicTheme`

However, you can pass in your own theme object, or part thereof. The theme structure is as follows (this is the "default" theme definition):

```js
{
  displayName: 'Default',
  fragments: { edit: 'rgb(42, 161, 152)' },
  styles: {
    container: {
      backgroundColor: '#f6f6f6',
      fontFamily: 'monospace',
    },
    collection: {},
    collectionInner: {},
    collectionElement: {},
    dropZone: {},
    property: '#292929',
    bracket: { color: 'rgb(0, 43, 54)', fontWeight: 'bold' },
    itemCount: { color: 'rgba(0, 0, 0, 0.3)', fontStyle: 'italic' },
    string: 'rgb(203, 75, 22)',
    number: 'rgb(38, 139, 210)',
    boolean: 'green',
    null: { color: 'rgb(220, 50, 47)', fontVariant: 'small-caps', fontWeight: 'bold' },
    input: ['#292929', { fontSize: '90%' }],
    inputHighlight: '#b3d8ff',
    error: { fontSize: '0.8em', color: 'red', fontWeight: 'bold' },
    iconCollection: 'rgb(0, 43, 54)',
    iconEdit: 'edit',
    iconDelete: 'rgb(203, 75, 22)',
    iconAdd: 'edit',
    iconCopy: 'rgb(38, 139, 210)',
    iconOk: 'green',
    iconCancel: 'rgb(203, 75, 22)',
  },
}

```

The `styles` property is the main one to focus on. Each key (`property`, `bracket`, `itemCount`) refers to a part of the UI. The value for each key is *either*:
- a `string`, in which case it is interpreted as the colour (or background colour in the case of `container` and `inputHighlight`)
- a full CSS style object for fine-grained definition. You only need to provide properties you wish to override — all unspecified ones will fallback to either the default theme, or another theme that you specify as the "base".
- a "Style Function", which is a function that takes the same input as [Filter Functions](#filter-functions), but returns a CSS style object (or `null`). This allows you to *dynamically* change styling of various elements based on content or structure.
- an array containing any combination of the above, in which case they are merged together. For example, you could provide a Theme Function with styling for a very specific condition, but then provide "fallback" styles whenever the function returns `null`. (In the array, the *later* items have higher precedence)

For a simple example, if you want to use the "githubDark" theme, but just change a couple of small things, you'd specify something like this:

```js
// in <JsonEditor /> props
theme={[
        githubDarkTheme,
        {
            iconEdit: 'grey',
            boolean: { color: 'red', fontStyle: 'italic', fontWeight: 'bold', fontSize: '80%' },
        },
      ]}
```

Which would change the "Edit" icon and boolean values from this:  
<img width="218" alt="Github Dark theme original" src="image/theme_edit_before.png">  
into this:  
<img width="218" alt="Github Dark theme modified" src="image/theme_edit_after.png">

Or you could create your own theme from scratch and overwrite the whole theme object.

So, to summarise, the `theme` prop can take *either*:

- an imported theme, e.g `"candyWrapperTheme"`
- a theme object:
  - can be structured as above with `fragments`, `styles`, `displayName` etc., or just the `styles` part (at the root level)
- a theme name *and* an override object in an array, i.e. `[ "<themeName>, {...overrides } ]`

You can play round with live editing of the themes in the [Demo app](https://carlosnz.github.io/json-edit-react/) by selecting "Edit this theme!" from the "Demo data" selector (though you won't be able to create functions in JSON).

#### CSS classes

Another way to style the component is to target the CSS classes directly. Every element in the component has a unique class name, so you should be able to locate them in your browser inspector and override them accordingly. All class names begin with the prefix `jer-`, e.g. `jer-collection-header-row`, `jer-value-string`.

### Fragments

The `fragments` property above is just a convenience to allow repeated style "fragments" to be defined once and referred to using an alias. For example, if you wanted all your icons to be blue and slightly larger and spaced out, you might define a fragment like so:
```js
fragments: { iconAdjust: { color: "blue", fontSize: "110%", marginRight: "0.6em" }}
```

Then in the theme object, just use:
```js
{
    ...,
    iconEdit: "iconAdjust",
    iconDelete: "iconAdjust",
    iconAdd: "iconAdjust",
    iconCopy: "iconAdjust",
}
```

Then, when you want to tweak it later, you only need to update it in one place!

Fragments can also be mixed with additional properties, and even other fragments, like so:
```js
iconEdit: [ "iconAdjust", "anotherFragment", { marginLeft: "1em" } ]
```

### A note about sizing and scaling

Internally, all sizing and spacing is done in `em`s, never `px` (aside from the [`rootFontSize`](#props-overview), which sets the "base" size). This makes scaling a lot easier — just change the `rootFontSize` prop (or set `fontSize` on the main container via targeting the class, or tweaking the [theme](#themes--styles)), and watch the *whole* component scale accordingly.

### Icons

The default icons can be replaced, but you need to provide them as React/HTML elements. Just define any or all of them within the `icons` prop, keyed as follows:

```js
 icons={{
  add: <YourIcon /> 
  edit: <YourIcon /> 
  delete: <YourIcon />
  copy: <YourIcon />
  ok: <YourIcon />
  cancel: <YourIcon />
  chevron: <YourIcon />
}}
```

The Icon components will need to have their own styles defined, as the theme styles *won't* be added to the custom elements.

## Localisation

Localise your implementation by passing in a `translations` object to replace the default strings. The keys and default (English) values are as follows:
```js
{
  ITEM_SINGLE: '{{count}} item',
  ITEMS_MULTIPLE: '{{count}} items',
  KEY_NEW: 'Enter new key',
  ERROR_KEY_EXISTS: 'Key already exists',
  ERROR_INVALID_JSON: 'Invalid JSON',
  ERROR_UPDATE: 'Update unsuccessful',
  ERROR_DELETE: 'Delete unsuccessful',
  ERROR_ADD: 'Adding node unsuccessful',
  DEFAULT_STRING: 'New data!',
  DEFAULT_NEW_KEY: 'key',
}

```

## Custom Nodes

You can replace certain nodes in the data tree with your own custom components. An example might be for an image display, or a custom date editor, or just to add some visual bling. See the "Custom Nodes" data set in the [interactive demo](https://carlosnz.github.io/json-edit-react/?data=customNodes) to see it in action. (There is also a custom Date picker that appears when editing ISO strings in the other data sets.)

Custom nodes are provided in the `customNodeDefinitions` prop, as an array of objects of following structure:

```js
{
  condition,            // a FilterFunction, as above
  element,              // React Component
  customNodeProps,      // object (optional)
  hideKey,              // boolean (optional)
  defaultValue,         // JSON value for a new instance of your component
  showOnEdit            // boolean, default false
  showOnView            // boolean, default true
  showEditTools         // boolean, default true
  name                  // string (appears in Types selector)
  showInTypesSelector,  // boolean (optional), default false
  
  // Only affects Collection nodes:
  showCollectionWrapper // boolean (optional), default true
  wrapperElement        // React component (optional) to wrap *outside* the normal collection wrapper
  wrapperProps          // object (optional) -- props for the above wrapper component
}
```

The `condition` is just a [Filter function](#filter-functions), with the same input parameters (`key`, `path`, `value`, etc.), and `element` is a React component. Every node in the data structure will be run through each condition function, and any that match will be replaced by your custom component. Note that if a node matches more than one custom definition conditions (from multiple components), the *first* one will be used, so place them in the array in priority order.

The component will receive *all* the same props as a standard node component (see codebase), but you can pass additional props to your component if required through the `customNodeProps` object. A thorough example of a custom Date picker is used in the demo (along with a couple of other more basic presentational ones), which you can inspect to see how to utilise the standard props and a couple of custom props. View the source code [here](https://github.com/CarlosNZ/json-edit-react/blob/main/demo/src/customComponents/DateTimePicker.tsx)

By default, your component will be presented to the right of the property key it belongs to, like any other value. However, you can hide the key itself by setting `hideKey: true`, and the custom component will take the whole row. (See the "Presented by" box in the "Custom Nodes" data set for an example.)

Also, by default, your component will be treated as a "display" element, i.e. it will appear in the JSON viewer, but when editing, it will revert to the standard editing interface. This can be changed, however, with the `showOnEdit`, `showOnView` and `showEditTools` props. For example, a Date picker might only be required when *editing* and left as-is for display. The `showEditTools` prop refers to the editing icons (copy, add, edit, delete) that appear to the right of each value on hover. If you choose to disable these but you still want to your component to have an "edit" mode, you'll have to provide your own UI mechanism to toggle editing.

You can allow users to create new instances of your special nodes by selecting them as a "Type" in the types selector when editing/adding values. Set `showInTypesSelector: true` to enable this. However, if this is enabled you need to also provide a `name` (which is what the user will see in the selector) and a `defaultValue` which is the data that is inserted when the user selects this "type". (The `defaultValue` must return `true` if passed through the `condition` function in order for it to be immediately displayed using your custom component.)

### Active hyperlinks

A simple custom component and definition to turn url strings into clickable links is provided with the main package for you to use out of the box. Just import and use like so:

```js
import { JsonEditor, LinkCustomNodeDefinition } from 'json-edit-react'

// ...Other stuff
return (
  <JsonEditor
    {...otherProps}
    customNodeDefinitions={[LinkCustomNodeDefinition, ...otherCustomDefinitions]}
  />
  )
```

### Custom Collection nodes

In most cases it will be preferable (and simpler) to create custom nodes to match *value* nodes (i.e. not `array` or `object` *collection* nodes), which is what all the [Demo](https://carlosnz.github.io/json-edit-react/?data=customNodes) examples show. However, if you *do* wish to target a whole collection node, there are a couple of other things to know:
- The normal descendants of this node can still be displayed using the [React `children`](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) property, it just becomes your component's responsibility to handle it.
- You can specify two different components in the definition:
  - the regular `element` prop, which will be displayed *inside* the collection brackets (i.e. it appears as the *contents* of the collection)
  - an optional `wrapperElement`, which is displayed *outside* the collection (props can be supplied as described above with `wrapperProps`). Again, the inner contents (including your custom `element`) can be displayed using React `children`. In this example, the **blue** border shows the `wrapperElement` and the **red** border shows the inner `element`:  
  <img width="450" alt="custom node levels" src="image/custom_component_levels.png"> 
- There is one additional prop, `showCollectionWrapper` (default `true`), which, when set to `false`, hides the surrounding collection elements (namely the hide/show chevron and the brackets). In this case, you would have to provide your own hide/show mechanism in your component should you want it.


## Custom Text

It's possible to change the various text strings displayed by the component. You can [localise it](#localisation), but you can also specify functions to override the displayed text based on certain conditions. For example, say we want the property count text (e.g. `6 items` by default) to give a summary of a certain type of node, which can look nice when collapsed. For example (taken from the [Demo](https://carlosnz.github.io/json-edit-react/?data=customNodes)):

<img width="391" alt="Custom text example" src="image/custom_text.png">

The `customText` property takes an object, with any of the [localisable keys](#localisation) as keys, with a function that returns a string (or `null`, which causes it to fallback to the localised or default string). The input to these functions is the same as for [Filter functions](#filter-functions), so in this example, it would be defined like so:

```js

// The function definition
const itemCountReplacement = ({ key, value, size }) => {
    // This returns "Steve Rogers (Marvel)" for the node summary
    if (value instanceof Object && 'name' in value)
      return `${value.name} (${(value)?.publisher ?? ''})`
    // This returns "X names" for the alias lists
    if (key === 'aliases' && Array.isArray(value))
      return `${size} ${size === 1 ? 'name' : 'names'}`
    // Everything else as normal
    return null
  }

// And in component props...
...otherProps,
customText = {
  ITEM_SINGLE: itemCountReplacement,
  ITEMS_MULTIPLE: itemCountReplacement,
}
```

## Keyboard customisation

The default keyboard controls are [outlined above](#usage), but it's possible to customise/override these. Just pass in a `keyboardControls` prop with the actions you wish to override defined. The default config object is:
```ts
{
  confirm: 'Enter',  // default for all Value nodes, and key entry
  cancel: 'Escape',
  objectConfirm: { key: 'Enter', modifier: ['Meta', 'Shift', 'Control'] },
  objectLineBreak: 'Enter',
  stringConfirm: 'Enter',
  stringLineBreak: { key: 'Enter', modifier: 'Shift' },
  numberConfirm: 'Enter',
  numberUp: 'ArrowUp',
  numberDown: 'ArrowDown',
  booleanConfirm: 'Enter',
  clipboardModifier: ['Meta', 'Control'],
  collapseModifier: 'Alt',
}
```

If (for example), you just wish to change the general "confirmation" action to "Cmd-Enter" (on Mac), or "Ctrl-Enter", you'd just pass in:
```ts
  keyboardControls = {
    confirm: {
      key: "Enter",
      modifier: [ "Meta", "Control" ]
    }
  }
```

**Considerations**:

- Key names come from [this list](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)
- Accepted modifiers are "Meta", "Control", "Alt", "Shift"
- On Mac, "Meta" refers to the "Cmd" key, and "Alt" refers to "Option"
- If multiple modifiers are specified (in an array), *any* of them will be accepted (multi-modifier commands not currently supported)
- You only need to specify values for `stringConfirm`, `numberConfirm`, and `booleanConfirm` if they should *differ* from your `confirm` value. 
- You won't be able to override system or browser behaviours: for example, on Mac "Ctrl-click" will perform a right-click, so using it as a click modifier won't work (hence we also accept "Meta"/"Cmd" as the default `clipboardModifier`).
 
## Undo functionality

Even though Undo/Redo functionality is probably desirable in most cases, this is not built in to the component, for two main reasons:
1. It would involve too much additional UI and I didn't want this component becoming opinionated about the look and feel beyond the essentials (which are mostly customisable/style-able anyway)
2. It is quite straightforward to implement using existing libraries. I've used **[use-undo](https://github.com/homerchen19/use-undo)** in the [Demo](https://carlosnz.github.io/json-edit-react/), which is working well.

## Exported helpers

A few helper functions, components and types that might be useful in your own implementations (from creating Filter or Update functions, or Custom components) are exported from the package:

### Functions & Components

- `themes`: an object containing all the built-in theme definitions
- `LinkCustomComponent`: the component used to render [hyperlinks](#active-hyperlinks)
- `LinkCustomNodeDefinition`: custom node definition for [hyperlinks](#active-hyperlinks)
- `IconAdd`, `IconEdit`, `IconDelete`, `IconCopy`, `IconOk`, `IconCancel`, `IconChevron`: all the built-in [icon](#icons) components
- `matchNode`, `matchNodeKey`: helpers for defining custom [Search](#searchfiltering) functions
- `truncate`: function to truncate a string to a specified length. See [here](https://github.com/CarlosNZ/json-edit-react/blob/d5fdbdfed6da7152f5802c67fbb3577810d13adc/src/ValueNodes.tsx#L9-L13)
- `extract`: function to extract a deeply nested object value from a string path. See [here](https://github.com/CarlosNZ/object-property-extractor)
- `assign`: function to set a deep object value from a string path. See [here](https://github.com/CarlosNZ/object-property-assigner)

### Types

- `ThemeName`: string literal list of built-in theme names
- `Theme`: a full [Theme](#themes--styles) object
- `ThemeInput`: input type for the `theme` prop
- `JsonEditorProps`: all input props for the Json Editor component
- `JsonData`: main `data` object -- any valid JSON structure
- [`UpdateFunction`](#update-functions), [`OnChangeFunction`](#onchange-function), [`OnErrorFunction`](#onerror-function) [`FilterFunction`](#filter-functions), [`CopyFunction`](#copy-function), [`SearchFilterFunction`](#searchfiltering), [`CompareFunction`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort),[`TypeFilterFunction`](#filter-functions), [`LocalisedString`](#localisation), [`CustomNodeDefinition`](#custom-nodes), [`CustomTextDefinitions`](#custom-text), [`CustomTextFunction`](#custom-text),
- `TranslateFunction`: function that takes a [localisation](#localisation) key and returns a translated string
- `IconReplacements`: input type for the `icons` prop
- `CollectionNodeProps`: all props passed internally to "collection" nodes (i.e. objects/arrays)
- `ValueNodeProps`: all props passed internally to "value" nodes (i.e. *not* objects/arrays)
- `CustomNodeProps`: all props passed internally to [Custom nodes](#custom-nodes); basically the same as `CollectionNodeProps` with an extra `customNodeProps` field for passing props unique to your component`
- `DataType`: `"string"` | `"number"` | `"boolean"` | `"null"` | `"object"` | `"array"`
- `KeyboardControls`: structure for [keyboard customisation](#keyboard-customisation) prop

## Issues, bugs, suggestions?

Please open an issue: https://github.com/CarlosNZ/json-edit-react/issues

## Roadmap

The main features I'd like to introduce are:

1. ~~**JSON Schema validation**. We can currently specify a reasonable degree of control over what can be edited using [Filter functions](#filter-functions) with the restriction props, but I'd like to go a step further and be able to pass in a [JSON Schema](https://json-schema.org/) and have the data be automatically validated against it, with the results reflected in the UI. This would allow control over data types and prevent missing properties, something that is not currently possible.~~ 👍 [Done](#json-schema-validation) (using 3rd-party validation library)
2. ~~**Search/Visibility filter** — allow the user to narrow the list of visible keys with a simple search input. This would be useful for very large data objects, but is possibly getting a bit too much in terms of opinionated UI, so would need to ensure it can be styled easily. Perhaps it would be better if the "Search" input was handled outside this package, and we just accepted a "search" string prop?~~ 👍 [Done](#searchfiltering)

## Inspiration

This component is heavily inspired by [react-json-view](https://github.com/mac-s-g/react-json-view), a great package that I've used in my own projects. However, it seems to have been abandoned now, and requires a few critical fixes, so I decided to create my own from scratch and extend the functionality while I was at it.

## Changelog

- **1.19.0**: Built-in [themes](#themes--styles) must now be imported separately -- this improves tree-shaking to prevent unused themes being bundled with your build
- **1.18.0**:
  - Ability to [customise keyboard controls](#keyboard-customisation)
  - Option to insert new values at the top
- **1.17.0**: `defaultValue` function takes the new `key` as second parameter
- **1.16.0**: Extend the "click" zone for collapsing nodes to the header bar and left margin (not just the collapse icon)
- **1.15.12**:
  - [Custom buttons](#custom-buttons)
  - Misc small bug fixes
- **1.15.7**:
  - Small bug fix for `overflow: clip` setting based on animating
  state
  - Small tweak to outer bracket positioning
- **1.15.5**: Bug fix for collapse icon being clipped when indent is low #104
- **1.15.3**:
  - Allow [UpdateFunction](#update-functions) to return `true` to represent success
  - Refactor collapse animation to improve lag and accuracy
- **1.15.2**:
  - Collapse animation timing is configurable (#96)
  - Bug fix for non-responsive keyboard submit for boolean values (#97)
- **1.15.0**: Remove ([JSON5](https://json5.org/)) from the package, and provided props for passing in *any* alternative JSON parsing and stringifying methods.
- **1.14.0**:
  - Allow [UpdateFunction](#update-functions) to return a modified value, not just an error
  - Add `setData` prop to discourage reliance on internal data [state management](#managing-state)
  - Refactor state/event management to use less `useEffect` hooks
- **1.13.3**: Bug fix for when root data value is `null` [#90](https://github.com/CarlosNZ/json-edit-react/issues/90)
- **1.13.2**: Slightly better error handling when validating [JSON schema](#json-schema-validation)
- **1.13.0**:
  - [Drag-n-drop](#drag-n-drop) editing!
  - Remove unnecessary dependency
  - Refactor some duplicate code into common hook
- **1.12.0**:
  - Preserve editing mode when changing Data Type
  - [`onError` callback](#onerror-function) available for custom error handling
- **1.11.8**: Fix regression for empty data root name introduces in 1.11.7
- **1.11.7**: Handle \<empty-string\> object keys / prevent duplicate keys
- **1.11.3**: Bug fix for invalid state when changing type to Collection node
- **1.11.0**:
  - Improve CSS definitions to prevent properties from being overridden by the host environment's CSS
  - Add `rootFontSize` prop to set the "base" size for the component
- **1.10.2**:
  - Fixes for text wrapping and content overlaps when values and inputs contain very long strings (#57, #58)
  - Only allow one element to be edited at a time, and prevent collapsing when an inner element is being edited.
- **1.9.0**:
  - Increment number input using up/down arrow keys
  - Option to display string values without "quotes"
  - Add [`onChange` prop](#onchange-function) to allow validation/restriction of user input as they type
  - Don't update `data` if user hasn't actually changed a value (prevents Undo from being unnecessarily triggered)
  - Misc HTML warnings, React compatibility fixes
- **1.8.0**: Further improvements/fixes to collection custom nodes, including additional  `wrapperElement` [prop](#custom-collection-nodes)
  - Add optional `id` prop
- **1.7.2**:
  - Fix and improve Custom nodes in *collections*
  - Include `index` in Filter (and other) function input
- **1.7.0**: Implement [Search/filtering](#searchfiltering) of data visibility
- **1.6.1**: Revert data state on Update Function error
- **1.6.0**: Allow a function for `defaultValue` prop
- **1.5.0**:
  - Open/close all descendant nodes by holding "Alt"/"Option" while opening/closing a node
- **1.4.0**:
  - [Style functions](#themes--styles) for context-dependent styling
  - Handle "loose" ([JSON5](https://json5.org/)) JSON text input(e.g. non-quoted keys, trailing commas, etc.)
- **1.3.0**:
  - [Custom (dynamic) text](#custom-text)
  - Add [hyperlink](#custom-nodes) Custom component to bundle
  - Better indentation of collection nodes (property name lines up with non-collection nodes, not the collapse icon)
- **1.2.2**: Allow editing of Custom nodes
- **1.1.0**: Don't manage data state within component
- **1.0.0**:
  - [Custom nodes](#custom-nodes)
  - Allow editing of keys
  - Option to define restrictions on data type selection
  - Option to hide array/object item counts
  - Improve keyboard interaction
- **0.9.6**: Performance improvement by not processing child elements if not visible
- **0.9.4**:
  - Layout improvements
  - Better internal handling of functions in data
- **0.9.3**: Bundle as ES6 module
- **0.9.1**: Export more Types from the package
- **0.9.0**: Initial release

