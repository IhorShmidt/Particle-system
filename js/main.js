// Generated by CoffeeScript 2.4.0
(function() {
  var Particle, ParticleSystem, Vec2, World, _Object, test;

  Vec2 = class Vec2 {
    constructor(x, y) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
    }

    add(vec) {
      this.x += vec.x;
      this.y += vec.y;
      return this;
    }

    copy() {
      return new Vec2(this.x, this.y);
    }

    static getRandom(min, max) {
      return new Vec2(Math.random() * (max - min) + min, Math.random() * (max - min) + min);
    }

  };

  // -----------------World
  World = class World {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');
      this.canvasWidth = this.canvas.width = 400;
      this.canvasHeight = this.canvas.height = 500;
      this.objects = [];
      this.controllable = {};
      this.mouse = new Vec2(this.canvasWidth / 2, this.canvasHeight / 2);
      this.canvas.addEventListener('mousemove', ((evt) => {
        return [this.mouse.x, this.mouse.y] = [evt.offsetX, evt.offsetY];
      }), false);
      this.canvas.addEventListener('mousewheel', ((e) => {
        e.preventDefault();
        if (this.controllable instanceof ParticleSystem) {
          if (e.shiftKey) {
            return this.controllable.scatter = Math.max(0, this.controllable.scatter - e.wheelDelta / 100);
          } else if (e.altKey) {
            return this.controllable.particalSize = Math.max(0, this.controllable.particleSize - e.wheelDelta / 100);
          } else {
            return this.controllable.particleLife = Math.max(1, this.controllable.particleLife - e.wheelDelta / 10);
          }
        }
      }), false);
      this.params = {
        gravity: new Vec2(0, -.2)
      };
    }

    addObject(constructor, config, controllable) {
      var obj;
      config.world = this;
      obj = new constructor(config);
      if (controllable) {
        obj.setControllable();
      }
      return this.objects.push(obj);
    }

    removeObject(index) {
      return this.objects.splice(index, 1);
    }

    start() {
      return this.tick();
    }

    tick() {
      this.update();
      this.draw();
      return requestAnimationFrame(this.tick.bind(this));
    }

    update() {
      var ind, j, len, object, ref, results;
      ref = this.objects;
      results = [];
      for (ind = j = 0, len = ref.length; j < len; ind = ++j) {
        object = ref[ind];
        if (object) {
          results.push(object.update(ind));
        }
      }
      return results;
    }

    draw() {
      var j, len, object, ref, results;
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.globalAlpha = 1;
      ref = this.objects;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        object = ref[j];
        results.push(object.draw());
      }
      return results;
    }

  };

  // -----------------OBJECT
  _Object = class _Object {
    constructor(config) {
      var ref, ref1;
      this.loc = (ref = config.loc) != null ? ref : new Vec2;
      this.speed = (ref1 = config.speed) != null ? ref1 : new Vec2;
      this.world = config.world;
    }

    update() {
      if (!(this instanceof ParticleSystem)) {
        this.speed.add(this.world.params.gravity);
      }
      return this.loc.add(this.speed);
    }

    notVisible(threshold) {
      return this.loc.y > this.world.canvasHeight + threshold || this.loc.y < -threshold || this.loc.x > this.world.canvasWidth + threshold || this.loc.x < -threshold;
    }

    setControllable() {
      this.world.controllable = this;
      return this.loc = this.world.mouse;
    }

  };

  // -----------------ParticleSystem
  ParticleSystem = class ParticleSystem extends _Object {
    constructor(config) {
      var ref, ref1, ref2, ref3, ref4;
      super(config);
      this.particles = [];
      this.maxParticles = (ref = config.maxParticles) != null ? ref : 300;
      this.particleLife = (ref1 = config.particleLife) != null ? ref1 : 60;
      this.particleSize = (ref2 = config.particleSize) != null ? ref2 : 24;
      this.creationRate = (ref3 = config.creationRate) != null ? ref3 : 3;
      this.scatter = (ref4 = config.scatter) != null ? ref4 : 1.3;
    }

    addParticle(config) {
      config.system = this;
      config.world = this.world;
      return this.particles.push(new Particle(config));
    }

    removeParticle(index) {
      return this.particles.splice(index, 1);
    }

    update() {
      var i, ind, j, k, len, particle, ref, ref1, results;
      if (!(this.particles.length > this.maxParticles)) {
        for (i = j = 0, ref = this.creationRate; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
          this.addParticle({
            loc: this.loc.copy(),
            speed: Vec2.getRandom(-this.scatter, this.scatter)
          });
        }
      }
      ref1 = this.particles;
      results = [];
      for (ind = k = 0, len = ref1.length; k < len; ind = ++k) {
        particle = ref1[ind];
        if (particle) {
          results.push(particle.update(ind));
        }
      }
      return results;
    }

    draw() {
      var j, len, particle, ref, results;
      ref = this.particles;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        particle = ref[j];
        results.push(particle.draw());
      }
      return results;
    }

  };

  // -----------------Particle
  Particle = class Particle extends _Object {
    constructor(config) {
      super(config);
      this.system = config.system;
      this.initialLife = this.system.particleLife;
      this.life = this.initialLife;
      this.size = this.system.particleSize;
    }

    update(ind) {
      super.update(ind);
      this.size = Math.max(0, this.system.particleSize * (this.life-- / this.initialLife));
      if (this.notVisible(100 || this.life < 0)) {
        return this.system.removeParticle(ind);
      }
    }

    draw() {
      var grad;
      this.world.globalCompositeOperation = 'lighter';
      this.world.ctx.globalAlpha = this.life / this.initialLife;
      grad = this.world.ctx.createRadialGradient(this.loc.x, this.loc.y, 0, this.loc.x, this.loc.y, this.size);
      grad.addColorStop(0, "rgba(255, 255, 255, .5)");
      grad.addColorStop(.3, "rgba(255, 255, 255, .3");
      grad.addColorStop(1, "transparent");
      this.world.ctx.fillStyle = grad;
      this.world.ctx.beginPath();
      this.world.ctx.arc(this.loc.x, this.loc.y, this.size, 0, 2 * Math.PI);
      return this.world.ctx.fill();
    }

  };

  //canvas = document.getElementById 'canvas'
  test = new World(document.getElementById('canvas'));

  window.test = test;

  //test.addObject ParticleSystem, {
  //  loc: new Vec2 200, 400
  //  particleSize: 30
  //  particleLife: 55
  //  scatter: .4
  //}, on
  test.addObject(ParticleSystem, {
    loc: new Vec2(200, 400),
    particleSize: 6,
    particleLife: 80,
    scatter: 1.6
  }, true);

  test.start();

}).call(this);
