export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type CoveyTownList = { friendlyName: string; coveyTownID: string; currentOccupancy: number; maximumOccupancy: number }[];

export type CoveyHubList = { friendlyName: string; coveyHubID: number; password : string, isPubliclyListed:boolean,occupancy:number,capacity:number}[];