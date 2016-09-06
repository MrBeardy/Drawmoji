export default class GGraphicBase {

  // TODO: Find a better name for component, or find a cleaner implementation
  constructor(context, component) {
    if (!context) {
      console.log(`WARNING: undefined context passed to a GGraphicBase.`)
    }

    this.context = context;
    this.component = component;
  }

  get canvasWidth() { return this.context.canvas.width }
  get canvasHeight() { return this.context.canvas.height }
}
