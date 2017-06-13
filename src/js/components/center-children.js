import {last} from 'lodash';

AFRAME.registerComponent('center-children', {
  init() {
    const childMesh = last(this.el.object3D.children);
    const {geometry} = childMesh;
    geometry.computeBoundingBox();

    const {x: maxX, y: maxY} = geometry.boundingBox.max;
    const {x: minX, y: minY} = geometry.boundingBox.min;

    this.lengthX = maxX - minX;
    this.lengthY = maxY - minY;

    this.centerChildren();
    this.el.addEventListener('center-children', this.centerChildren.bind(this));
  },
  centerChildren() {
    const childEntities = this.el.getChildEntities();
    this.waitForChildren(
      childEntities,
      this.setChildPositions.bind(this, childEntities)
    );
  },
  getBounding(geometry) {
    geometry.computeBoundingBox();
    const {x: childMaxX, y: childMaxY} = geometry.boundingBox.max;
    const {x: childMinX, y: childMinY} = geometry.boundingBox.min;

    return {childMinX, childMaxX, childMinY, childMaxY};
  },
  setChildPositions(children) {
    /* eslint-disable */
    const margin = 0.05;
    let heightUsed = 0;

    let childPositions = [];
    children.forEach((child, i, arr) => {
      const scale = child.getAttribute('scale');
      const childObj = child.object3D;
      const childMesh = childObj.children[0];
      const bounding = this.getBounding(childMesh.geometry);
      const {childMinX, childMaxX, childMinY, childMaxY} = bounding;

      const childLengthX = childMaxX - childMinX;
      const extraX = this.lengthX - childLengthX;
      let posX = -(this.lengthX / 2) + (extraX / 2);
      posX *= scale.x;

      const childLengthY = childMaxY - childMinY;
      let posY = 0;
      if (i > 0) {
        const lastChild = childPositions[i - 1];
        posY = lastChild.posY + lastChild.childLengthY + margin;
        posY *= scale.y;
        heightUsed += childLengthY + margin;
      }

      childPositions.push({posX, posY, childLengthY});
    });

    childPositions.forEach((c, i, arr) => {
      c.posY = c.posY - (heightUsed / arr.length);
    });

    children.forEach((c, i) => {
      const cfg = childPositions[i];
      console.log(`SETTING POS ${cfg.posX} ${-cfg.posY} 0`);
      c.setAttribute('position', `${cfg.posX} ${-cfg.posY} 0`);
      const currMaterial = c.getAttribute('material');
      c.setAttribute('material', {
        ...currMaterial,
        opacity: 1,
      });
    });
  },
  waitForChildren(children, cb) {
    let loaded = 0;
    children.forEach(child => {
      this.checkBounding(child, Math.random(), () => {
        loaded++;
      });
    });

    this.waitInterval = setInterval(() => {
      if (loaded === children.length) {
        clearInterval(this.waitInterval);
        cb();
      }
    }, 10);
  },
  checkBounding(el, id, cb) {
    const timeoutName = `timeout_${id}`;
    window[timeoutName] = setInterval(() => {
      if (!el.object3D) return;
      const child = el.object3D.children[0];
      const bounding = this.getBounding(child.geometry);
      const checkFinite = () => {
        return Object.keys(bounding).some(b => bounding[b] === Infinity);
      }
      if (!checkFinite()) {
        clearInterval(window[timeoutName]);
        cb();
      }
    }, 10);
  }
});
