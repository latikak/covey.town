import CoveyTownController from './CoveyTownController';
import { CoveyHubList, CoveyTownList } from '../CoveyTypes';
import CoveyHubController from './CoveyHubController';
import CoveyHubStore from './CoveyHubStore';

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

export default class CoveyTownsStore {
  private static _instance: CoveyTownsStore;

  private _towns: CoveyTownController[] = [];
  
  private _hubs: CoveyHubController[] = [];

  static getInstance(): CoveyTownsStore {
    if (CoveyTownsStore._instance === undefined) {
      CoveyTownsStore._instance = new CoveyTownsStore();
    }
    return CoveyTownsStore._instance;
  }

  getControllerForTown(coveyTownID: string): CoveyTownController | undefined {
    return this._towns.find(town => town.coveyTownID === coveyTownID);
  }

  getTowns(): CoveyTownList {
    return this._towns.filter(townController => townController.isPubliclyListed)
      .map(townController => ({
        coveyTownID: townController.coveyTownID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
  }

  getHubs(): CoveyHubList {
    return this._hubs.filter(hubController => hubController.isPubliclyListed)
      .map(hubController => ({
        coveyHubID: hubController.coveyHubID,
        friendlyName: hubController.friendlyName,
        password: hubController.hubUpdatePassword,
      }));
  }
  
  createTown(friendlyName: string, isPubliclyListed: boolean): CoveyTownController {
    const newTown = new CoveyTownController(friendlyName, isPubliclyListed);
    this._towns.push(newTown);

    const hubsStore = CoveyHubStore.getInstance();
    const hospitalHub = hubsStore.createHub('Hospital', true, newTown.coveyTownID, 4);
    // const hospitalHub = new CoveyHubController('Hospital', true, newTown.coveyTownID, 4 );
    this._hubs.push(hospitalHub);
    const schoolHub = hubsStore.createHub('School', true, newTown.coveyTownID, 7);
    // const schoolHub = new CoveyHubController('School', true, newTown.coveyTownID, 7);
    this._hubs.push(schoolHub);
    // const schoolHub = hubsStore.createHub('School', true, 7);
    // 
    // Add Private Hubs
    const privHub1 = hubsStore.createHub('House_1', true, newTown.coveyTownID, 1);
    // const privHub1 = new CoveyHubController('House_1', false, newTown.coveyTownID, 1);
    this._hubs.push(privHub1);
    const privHub2 = hubsStore.createHub('House_2', true, newTown.coveyTownID, 2);

    // const privHub2 = new CoveyHubController('House_1', false, newTown.coveyTownID, 1);
    this._hubs.push(privHub2);
    const privHub3 = hubsStore.createHub('House_3', true, newTown.coveyTownID, 3);
    this._hubs.push(privHub3);
    const privHub5 = hubsStore.createHub('House_5', true, newTown.coveyTownID, 5);
    this._hubs.push(privHub5);
    const privHub6 = hubsStore.createHub('House_6', true, newTown.coveyTownID, 6);

    // const privHub6 = new CoveyHubController('House_6', false, newTown.coveyTownID, 6);
    this._hubs.push(privHub6);

    return newTown;


  }

  updateTown(coveyTownID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingTown.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingTown.isPubliclyListed = makePublic;
      }
      return true;
    }
    return false;
  }

  deleteTown(coveyTownID: string, coveyTownPassword: string): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      this._towns = this._towns.filter(town => town !== existingTown);
      existingTown.disconnectAllPlayers();
      return true;
    }
    return false;
  }

}
