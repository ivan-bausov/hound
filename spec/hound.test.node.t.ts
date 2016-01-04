/// <reference path="../typings/tsd.d.ts" />

import _ = require('underscore');
import Q = require('q');
import Hound from '../hound.node.t';
import {ISurroundings, Direction, Location} from "../hound.node.i";

interface Element {
    key:string;
    x:number;
    y:number;
    LEFT?:string;
    RIGHT?:string;
    UP?:string;
    DOWN?:string;
    selector?:string;
}

class SurroundingsMock implements ISurroundings {
    constructor(private selector:string) {

    }

    locate(target_selector:string):Q.Promise<Location> {
        var defer:Q.Deferred<Location> = Q.defer<Location>();

        setTimeout(() => {
            var element:Element = _.find(this.elements, (element:Element) => element.selector && element.selector.search(target_selector) !== -1);
            defer.resolve({
                x: element.x,
                y: element.y
            });
        }, 0);

        return defer.promise;
    }

    move(direction:Direction):Q.Promise<void> {
        var defer:Q.Deferred<void> = Q.defer<void>();

        setTimeout(() => {
            var element:Element = _.find(this.elements, (element:Element) => element.selector === this.selector),
                target_key:string = element[Direction[direction]];

            if (target_key) {
                element.selector = element.selector.replace(this.selector, '');
                element = _.find(this.elements, (element:Element) => element.key === target_key);
                element.selector = element.selector ? element.selector + this.selector : this.selector;
            }

            defer.resolve(void 0);
        }, 0);

        return defer.promise;
    }

    public setElements(elements:Element[]):void {
        this.elements = elements;
    }

    private elements:Element[] = [];
}

var HOUND_SELECTOR:string = 'hound',
    PREY_SELECTOR:string = 'prey';

describe('Hound', () => {
    beforeEach(() => {
        this.surroundings = new SurroundingsMock(HOUND_SELECTOR);
        spyOn(this.surroundings, 'move').and.callThrough();

        this.hound = new Hound({
            hound_selector: HOUND_SELECTOR,
            surroundings: this.surroundings,
            log: console.log
        });
    });
    it('находит жертву по запаху', (done) => {
        this.surroundings.setElements([
                {
                    key: '0',
                    x: 0,
                    y: 0,
                    DOWN: '1',
                    selector: HOUND_SELECTOR
                },
                {
                    key: '1',
                    x: 0,
                    y: 1,
                    UP: '0',
                    RIGHT: '2'
                },
                {
                    key: '2',
                    x: 1,
                    y: 1,
                    LEFT: '1',
                    RIGHT: '3'
                },
                {
                    key: '3',
                    x: 2,
                    y: 1,
                    LEFT: '2',
                    selector: PREY_SELECTOR
                }
            ]);

        this.hound.hunt(PREY_SELECTOR).then(() => {
            expect(this.surroundings.move.calls.allArgs()).toEqual([
                [Direction.DOWN],
                [Direction.RIGHT],
                [Direction.RIGHT]
            ]);
            this.surroundings.locate(HOUND_SELECTOR).then((location:Location) => {
                expect(location).toEqual({x:2,y:1});
                done();
            });
        });
    });

    it('преодалевает петлю', (done) => {
        this.surroundings.setElements([
                {
                    key: '0',
                    x: 0,
                    y: 0,
                    DOWN: '1',
                    selector: HOUND_SELECTOR
                },
                {
                    key: '1',
                    x: 0,
                    y: 1,
                    UP: '0',
                    RIGHT: '2'
                },
                {
                    key: '2',
                    x: 1,
                    y: 1,
                    LEFT: '1',
                    UP: '3'
                },
                {
                    key: '3',
                    x: 2,
                    y: 0,
                    DOWN: '2',
                    selector: PREY_SELECTOR
                }
            ]);

        this.hound.hunt(PREY_SELECTOR).then(() => {
            expect(this.surroundings.move.calls.allArgs()).toEqual([
                [Direction.DOWN],
                [Direction.RIGHT],
                [Direction.UP]
            ]);
            this.surroundings.locate(HOUND_SELECTOR).then((location:Location) => {
                expect(location).toEqual({x:2,y:0});
                done();
            });
        });
    });
});
