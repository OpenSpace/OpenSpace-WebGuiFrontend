# OpenSpace WebGUI Module

## Develop

First, go get [Node.js](https://nodejs.org/en/)!

```sh
# install dependencies
npm install
# run development app
npm start
# open gui
open http://localhost:4690
```

To run the development version of the gui inside OpenSpace, go to `data/assets/customization/gui.asset` and change the dev flag to true.

### Components

There are several useful and reusable components to make it easier for you as the developer. Most of
these general-purpose components are in [`src/comoponents/common`](src/components/common).

### Types

This is something you hear quite often:

> MEH! JavaScript is the worst, there's no types or anything. Boo!! <br> - *Some developers*

It is not true. JavaScript has lots of types, but they might be a bit scary for the developers who's into strict typing.

To make this a bit easier for y'all, this web app has support for types using the Flow system. In some files, you might see a comment looking like 

```js
// @flow
```

This tells our transpiler Babel (that makes our modern JavaScript readable for all browsers) that this file should be type checked! 
A type declaration looks like

```js
function stringReturner(a: string, bMightBeAnything): string {
  //                     ^^^^^^^^                   ^^^^^^^^
  // The interesting parts of this code snippet is higlighted above 
}
```

For more about Flow, check out https://flow.org

## Deploy

When pushed to master, a github hook will be triggered to build the gui.
In the main OpenSpace repository, go to `data/assets/util/webgui.asset` and change the commit hash to the latest one. Make sure to test it in production mode before pushing the update to OpenSpace master, i.e. change the dev flag to false in  `data/assets/customization/gui.asset`. The production gui is served at http://localhost:4680.
