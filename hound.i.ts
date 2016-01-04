export enum Direction {
    NONE,
    LEFT,
    RIGHT,
    UP,
    DOWN
}

export interface ISurroundings {
    locate(target_selector:string):Q.Promise<Location>;
    move(direction:Direction):Q.Promise<void>;
}

export interface Options {
    hound_selector:string;
    surroundings: ISurroundings;
    log?: (msg:string) => void;
}

export interface Location {
    x: number;
    y: number;
}