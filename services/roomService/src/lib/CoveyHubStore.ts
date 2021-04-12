import { CoveyHubList } from '../CoveyTypes';
import CoveyHubController from './CoveyHubController';

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

export default class CoveyHubStore {
  private static _instance: CoveyHubStore;

  private _hubs: CoveyHubController[] = [];

  static getInstance(): CoveyHubStore {
    if (CoveyHubStore._instance === undefined) {
      CoveyHubStore._instance = new CoveyHubStore();
    }
    return CoveyHubStore._instance;
  }

  getControllerForHub(coveyHubID: number): CoveyHubController | undefined {
    return this._hubs.find(hub => hub.coveyHubID === coveyHubID);
  }

  getHubs(): CoveyHubList {
    return this._hubs.filter(hubController => hubController.isPubliclyListed)
      .map(hubController => ({
        coveyHubID: hubController.coveyHubID,
        friendlyName: hubController.friendlyName,
        password: hubController.hubUpdatePassword,
        isPubliclyListed:hubController.isPubliclyListed,
      }));
  }

  
  createHub(friendlyName: string, isPubliclyListed: boolean, coveyTownID: string, hubID: number): CoveyHubController {
    const newHub = new CoveyHubController(friendlyName, isPubliclyListed, coveyTownID, hubID);
    this._hubs.push(newHub);
    return newHub;
  } 

  updateHub(coveyHubID: number, coveyHubPassword: string, friendlyName?: string, makePublic?: boolean): boolean {
    const existingHub = this.getControllerForHub(coveyHubID);
    if (existingHub && passwordMatches(coveyHubPassword, existingHub.hubUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingHub.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingHub.isPubliclyListed = makePublic;
      }
      return true;
    }
    return false;
  }

  deleteHub(coveyHubID: number, coveyHubPassword: string): boolean {
    const existingHub = this.getControllerForHub(coveyHubID);
    if (existingHub && passwordMatches(coveyHubPassword, existingHub.hubUpdatePassword)) {
      this._hubs = this._hubs.filter(hub => hub !== existingHub);
      existingHub.disconnectAllPlayers();
      return true;
    }
    return false;
  }

}
