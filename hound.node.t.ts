/// <reference path="./typings/tsd.d.ts" />

import Q = require('q');
import {Options, Direction, ISurroundings, Location} from "./hound.node.i";

export default class Hound {
    constructor(options:Options) {
        this.surroundings = options.surroundings;
        this.hound_selector = options.hound_selector;
        this.log = options.log ? options.log : (msg:string) => {};
    }

    public hunt(pray_selector:string):Hound {
        this.setOn(pray_selector);
        return this.huntThePrey();
    }

    public then(cb:(any)=>any):Q.Promise<any> {
        return this.hunt_itertion.then(cb);
    }

    private huntThePrey():Hound {
        var hunt_iteration_defer:Q.Deferred<void> = Q.defer<void>();
        this.hunt_itertion = hunt_iteration_defer.promise;
        hunt_iteration_defer.resolve(void 0);

        this.log('hunt the prey');

        return this
            .lookAround()
            .trackDownThePrey()
            .move();
    }

    private trackDownThePrey():Hound {
        return this.act(() => {
            this.log('track down the prey');
            return this.surroundings
                .locate(this.prey_selector)
                .then((location:Location) => this.prey_location = location);
        });
    }

    private lookAround():Hound {
        return this.act(() => {
            this.log('look around');
            return this.surroundings
                .locate(this.hound_selector)
                .then((location:Location) => this.hound_location = location);
        });
    }

    private identifyLocation():string {
        return this.hound_location.x + '_' + this.hound_location.y;
    }

    private move():Hound {
        return this.act(() => {
            this.log('move');
            var direction = this.smellDirection();
            if (direction !== Direction.NONE) {
                this.log('move to: ' + Direction[direction]);

                return this.surroundings
                    .move(direction)
                    .then(() => this.huntThePrey().then(() => {}));
            } else {
                this.log('pray found');
                return;
            }
        });
    }

    private act(cb:(any)=>any):Hound {
        this.hunt_itertion = this.hunt_itertion.then(cb);
        return this;
    }

    private smellDirection():Direction {
        var direction:Direction = Direction.NONE,
            x:number = this.hound_location.x - this.prey_location.x,
            y:number = this.hound_location.y - this.prey_location.y;

        if (x === 0 && y === 0) {
            return direction;
        }

        if (!this.memory[this.identifyLocation()]) {
            let directions:Direction[] = [];

            if (x === 0) {
                directions.push(y > 0 ? Direction.UP : Direction.DOWN);
                directions.push(Direction.LEFT);
                directions.push(Direction.RIGHT);
                directions.push(y < 0 ? Direction.UP : Direction.DOWN);
            } else if (y === 0) {
                directions.push(x > 0 ? Direction.LEFT : Direction.RIGHT);
                directions.push(Direction.UP);
                directions.push(Direction.DOWN);
                directions.push(x < 0 ? Direction.LEFT : Direction.RIGHT);
            } else if (Math.abs(x) > Math.abs(y)) {
                directions.push(y > 0 ? Direction.UP : Direction.DOWN);
                directions.push(x > 0 ? Direction.LEFT : Direction.RIGHT);
                directions.push(y < 0 ? Direction.UP : Direction.DOWN);
                directions.push(x < 0 ? Direction.LEFT : Direction.RIGHT);
            } else {
                directions.push(x > 0 ? Direction.LEFT : Direction.RIGHT);
                directions.push(y > 0 ? Direction.UP : Direction.DOWN);
                directions.push(x < 0 ? Direction.LEFT : Direction.RIGHT);
                directions.push(y < 0 ? Direction.DOWN : Direction.UP);
            }
            this.memory[this.identifyLocation()] = directions;
        }

        direction = this.memory[this.identifyLocation()].shift();
        this.memory[this.identifyLocation()].push(direction);

        return direction;
    }

    private setOn(prey_selector:string):void {
        this.memory = {};
        this.prey_selector = prey_selector;
    }

    private memory:_.Dictionary<Direction[]> = {};
    private hound_selector:string;
    private hound_location:Location;
    private prey_selector:string;
    private prey_location:Location;
    private surroundings:ISurroundings;
    private hunt_itertion:Q.Promise<void>;
    private log:(msg:string)=>void;
}