import {nanoid} from 'nanoid';
import {mock, mockReset} from 'jest-mock-extended';
import TwilioVideo from './TwilioVideo';
import Player from '../types/Player';
import CoveyTownController from './CoveyTownController';
import CoveyHubController from './CoveyHubController';
import CoveyHubListener from '../types/CoveyHubListener';
import {UserLocation} from '../CoveyTypes';

jest.mock('./TwilioVideo');

const mockGetTokenForTown = jest.fn();
// eslint-disable-next-line
// @ts-ignore it's a mock
TwilioVideo.getInstance = () => ({
  getTokenForTown: mockGetTokenForTown,
});

function generateTestLocation(): UserLocation {
  return {
    rotation: 'back',
    moving: Math.random() < 0.5,
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
  };
}
describe('hub listeners and events', () => {
  let testingHub: CoveyHubController;
  const mockListeners = [mock<CoveyHubListener>(),
    mock<CoveyHubListener>(),
    mock<CoveyHubListener>()];
  beforeEach(() => {
    const townName = `FriendlyNameTest-${nanoid()}`;
    const townController = new CoveyTownController(townName, true);
    // eslint-disable-next-line prefer-destructuring
    testingHub = townController.getHubControllers()[0];
    mockListeners.forEach(mockReset);
  });
  it('should notify added listeners of player movement when updatePlayerLocation is called', async () => {
    const player = new Player('test player');
    await testingHub.addPlayer(player);
    const newLocation = generateTestLocation();
    mockListeners.forEach(listener => testingHub.addHubListener(listener));
    testingHub.updatePlayerLocation(player, newLocation);
    mockListeners.forEach(listener => expect(listener.onPlayerMoved).toBeCalledWith(player));
  });
  it('should notify added listeners of player disconnections when destroySession is called', async () => {
    const player = new Player('test player');
    const session = await testingHub.addPlayer(player);

    mockListeners.forEach(listener => testingHub.addHubListener(listener));
    testingHub.destroySession(session);
    mockListeners.forEach(listener => expect(listener.onPlayerDisconnected).toBeCalledWith(player));
  });
  it('should notify added listeners of new players when addPlayer is called', async () => {
    mockListeners.forEach(listener => testingHub.addHubListener(listener));

    const player = new Player('test player');
    await testingHub.addPlayer(player);
    mockListeners.forEach(listener => expect(listener.onPlayerJoined).toBeCalledWith(player));
  });
  it('should notify added listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
    const player = new Player('test player');
    await testingHub.addPlayer(player);

    mockListeners.forEach(listener => testingHub.addHubListener(listener));
    testingHub.disconnectAllPlayers();
    mockListeners.forEach(listener => expect(listener.onHubDestroyed).toBeCalled());

  });
  it('should not notify removed listeners of player movement when updatePlayerLocation is called', async () => {
    const player = new Player('test player');
    await testingHub.addPlayer(player);

    mockListeners.forEach(listener => testingHub.addHubListener(listener));
    const newLocation = generateTestLocation();
    const listenerRemoved = mockListeners[1];
    testingHub.removeHubListener(listenerRemoved);
    testingHub.updatePlayerLocation(player, newLocation);
    expect(listenerRemoved.onPlayerMoved).not.toBeCalled();
  });
  it('should not notify removed listeners of player disconnections when destroySession is called', async () => {
    const player = new Player('test player');
    const session = await testingHub.addPlayer(player);

    mockListeners.forEach(listener => testingHub.addHubListener(listener));
    const listenerRemoved = mockListeners[1];
    testingHub.removeHubListener(listenerRemoved);
    testingHub.destroySession(session);
    expect(listenerRemoved.onPlayerDisconnected).not.toBeCalled();

  });
  it('should not notify removed listeners of new players when addPlayer is called', async () => {
    const player = new Player('test player');

    mockListeners.forEach(listener => testingHub.addHubListener(listener));
    const listenerRemoved = mockListeners[1];
    testingHub.removeHubListener(listenerRemoved);
    const session = await testingHub.addPlayer(player);
    testingHub.destroySession(session);
    expect(listenerRemoved.onPlayerJoined).not.toBeCalled();
  });

  it('should not notify removed listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
    const player = new Player('test player');
    await testingHub.addPlayer(player);

    mockListeners.forEach(listener => testingHub.addHubListener(listener));
    const listenerRemoved = mockListeners[1];
    testingHub.removeHubListener(listenerRemoved);
    testingHub.disconnectAllPlayers();
    expect(listenerRemoved.onHubDestroyed).not.toBeCalled();

  });
});
/*
describe('hubSubscriptionHandler', () => {
  const mockSocket = mock<Socket>();
  let testingHub: CoveyHubController;
  let player: Player;
  let session: PlayerSession;
  beforeEach(async () => {
    const townName = `FriendlyNameTest-${nanoid()}`;
    const townController = new CoveyTownController(townName, true);
    testingHub = townController.getHubControllers()[0];
    mockReset(mockSocket);
    player = new Player('test player');
    session = await testingHub.addPlayer(player);
  }); 
  describe('with a valid session token', () => {
    it('should add a hub listener, which should emit "newPlayer" to the socket when a player joins', async () => {
      TestUtils.setSessionTokenAndTownID(testingHub.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      await testingHub.addPlayer(player);
      expect(mockSocket.emit).toBeCalledWith('newPlayer', player);
    });
    it('should add a town listener, which should emit "playerMoved" to the socket when a player moves', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      testingTown.updatePlayerLocation(player, generateTestLocation());
      expect(mockSocket.emit).toBeCalledWith('playerMoved', player);

    });
    it('should add a town listener, which should emit "playerDisconnect" to the socket when a player disconnects', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      testingTown.destroySession(session);
      expect(mockSocket.emit).toBeCalledWith('playerDisconnect', player);
    });
    it('should add a town listener, which should emit "townClosing" to the socket and disconnect it when disconnectAllPlayers is called', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      testingTown.disconnectAllPlayers();
      expect(mockSocket.emit).toBeCalledWith('townClosing');
      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    describe('when a socket disconnect event is fired', () => {
      it('should remove the town listener for that socket, and stop sending events to it', async () => {
        TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
        hubSubscriptionHandler(mockSocket);

        // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
        const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
        if (disconnectHandler && disconnectHandler[1]) {
          disconnectHandler[1]();
          const newPlayer = new Player('should not be notified');
          await testingTown.addPlayer(newPlayer);
          expect(mockSocket.emit).not.toHaveBeenCalledWith('newPlayer', newPlayer);
        } else {
          fail('No disconnect handler registered');
        }
      });
      it('should destroy the session corresponding to that socket', async () => {
        TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
        hubSubscriptionHandler(mockSocket);

        // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
        const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
        if (disconnectHandler && disconnectHandler[1]) {
          disconnectHandler[1]();
          mockReset(mockSocket);
          TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
          hubSubscriptionHandler(mockSocket);
          expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
        } else {
          fail('No disconnect handler registered');
        }

      });
    });
    it('should forward playerMovement events from the socket to subscribed listeners', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      const mockListener = mock<CoveyHubListener>();
      testingTown.addHubListener(mockListener);
      // find the 'playerMovement' event handler for the socket, which should have been registered after the socket was connected
      const playerMovementHandler = mockSocket.on.mock.calls.find(call => call[0] === 'playerMovement');
      if (playerMovementHandler && playerMovementHandler[1]) {
        const newLocation = generateTestLocation();
        player.location = newLocation;
        playerMovementHandler[1](newLocation);
        expect(mockListener.onPlayerMoved).toHaveBeenCalledWith(player);
      } else {
        fail('No playerMovement handler registered');
      } 
    }); 
  }); 
}); */
