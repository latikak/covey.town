import { Express } from 'express';
import BodyParser from 'body-parser';
import io from 'socket.io';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import {
  townCreateHandler, townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
  hubRequestHandler,
  hubCurrentRequestHandler,
  hubCurretIdGetRequestHandler,
  hubPasswordStoreRequestHandler,
  hubPasswordRequestHandler, 
  listAllHubsInTownRequestHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';



export default function addTownRoutes(http: Server, app: Express): io.Server {
  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(500)
        .json({
          message: 'Internal server error, please see log in server for details',
        });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await townListHandler();
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
  * List all hubs in a town
  */
  app.post('/hubs', BodyParser.json(), async (_req, res) => {
    try {
      const result = await hubRequestHandler({
        coveyTownID:_req.body.coveyTownID,
        coveyHubID:_req.body.coveyHubID,
        coveyHubPassword:_req.body.coveyHubPassword,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
  * Stores the current Hub Id.
  */
  app.post('/currentHubId', BodyParser.json(), async (_req, res) => {
    try {
      const result = await hubCurrentRequestHandler({
        coveyTownID:_req.body.coveyTownID,
        coveyHubID:_req.body.coveyHubID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

    
  /**
  * Gets the current Hub Id.
  */
  app.post('/currentHubIdRequest', BodyParser.json(), async (_req, res) => {
    try {
      const result = await hubCurretIdGetRequestHandler({
        coveyTownID:_req.body.coveyTownID,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
  * Stores the password for the current Hub Id.
  */
  app.post('/currentPassword', BodyParser.json(), async (_req, res) => {
    try {
      const result = await hubPasswordStoreRequestHandler({
        coveyTownID:_req.body.coveyTownID,
        coveyHubID:_req.body.coveyHubID,
        coveyHubPassword:_req.body.coveyHubPassword,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
  * Gets the password for the current Id.
  */
  app.post('/currentPasswordRequest', BodyParser.json(), async (_req, res) => {
    try {
      const result = await hubPasswordRequestHandler({
        coveyTownID:_req.body.coveyTownID,
        coveyHubID:_req.body.coveyHubID,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });
  

  /* app.post('/hubJoinRequest', BodyParser.json(), async (_req, res) => {
    try {
      const result = await hubJoinRequestHandler({
        coveyTownID:_req.body.coveyTownID,
        coveyHubPassword:_req.body.coveyHubPassword,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  }); 

  /* app.get('/hubJoinRequest/:townId', BodyParser.json(), async (_req, res) => {
    try {
      const result = await hubJoinRequestHandler({
        coveyTownID:_req.body.coveyTownID,
       // coveyHubID:_req.body.coveyHubID,
        coveyHubPassword:_req.body.coveyHubPassword
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  }); */
  /**
   * Create a town
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await townCreateHandler(req.body);
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
   * Get all hubs in a town.
   */
  
  app.get('/towns/:townId', BodyParser.json(), async (req, res) => {
    try {
      const result = await listAllHubsInTownRequestHandler({
        coveyTownID:req.params.townId,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
   * Update a town
   */
  app.patch('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  
  /*
  Add Hub
   */
  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
