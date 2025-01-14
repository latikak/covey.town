import React, { useEffect, useState ,useCallback} from 'react';
import {
  FormLabel,
  Button, Input,useToast, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  List, ListItem, ListIcon ,  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
 } from '@chakra-ui/react';
  import {FaRegBuilding } from "react-icons/fa";
  import {RiLockPasswordLine,RiBuilding2Line } from "react-icons/ri";
  import { SiBandsintown } from "react-icons/si";
import Phaser from 'phaser';
import Player, { UserLocation } from '../../classes/Player';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import TownsServiceClient, { TownsList } from '../../classes/TownsServiceClient';

// Importing toastify module
    
 // toast-configuration method, 
 // it is compulsory method.
// toast.configure()
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
class CoveyGameScene extends Phaser.Scene {
  private player?: {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, label: Phaser.GameObjects.Text
  };

  private currentHospitalOccupants  = 0;

  private id?: string;

  private players: Player[] = [];

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private previouslyCapturedKeys: number[] = [];

  private lastLocation?: UserLocation;

  private ready = false;

  private paused = false;

  private video: Video;

  private emitMovement: (loc: UserLocation) => void;

  private apiClientService:TownsServiceClient;

  private setIsPrivate:React.Dispatch<React.SetStateAction<boolean>>;

  private setCurrentHubId:React.Dispatch<React.SetStateAction<number>>;

  private isAuthenticated:boolean;

  constructor(video: Video, emitMovement: (loc: UserLocation) => void,apiClient:TownsServiceClient,setIsPrivate:React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentHubId:React.Dispatch<React.SetStateAction<number>>,isAuthenticated:boolean) {
    super('PlayGame');
    this.video = video;
    this.emitMovement = emitMovement;
    this.apiClientService=apiClient;
    this.setIsPrivate=setIsPrivate;
    this.setCurrentHubId=setCurrentHubId;
    this.isAuthenticated=isAuthenticated;
  }

  preload() {
    // this.load.image("logo", logoImg);
    this.load.image('tiles', '/assets/tilesets/tuxmon-sample-32px-extruded.png');
    this.load.image('tiles2', '/assets/roguelikeIndoor_transparent32px.png');
    this.load.image('tiles3', '/assets/roguelikeSheet_transparent32px.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/tuxemon-town4.json');
    this.load.atlas('atlas', '/assets/atlas/atlas.png', '/assets/atlas/atlas.json');
    this.load.html('passwordForm', '/assets/html/password.html');

  }

  updatePlayersLocations(players: Player[]) {
    if (!this.ready) {
      this.players = players;
      return;
    }
    players.forEach((p) => {
      this.updatePlayerLocation(p);
    });
    // Remove disconnected players from board
    const disconnectedPlayers = this.players.filter(
      (player) => !players.find((p) => p.id === player.id),
    );
    disconnectedPlayers.forEach((disconnectedPlayer) => {
      if (disconnectedPlayer.sprite) {
        disconnectedPlayer.sprite.destroy();
        disconnectedPlayer.label?.destroy();
      }
    });
    // Remove disconnected players from list
    if (disconnectedPlayers.length) {
      this.players = this.players.filter(
        (player) => !disconnectedPlayers.find(
          (p) => p.id === player.id,
        ),
      );
    }
  }

  updatePlayerLocation(player: Player) {
    let myPlayer = this.players.find((p) => p.id === player.id);
    if (!myPlayer) {
      let { location } = player;
      if (!location) {
        location = {
          rotation: 'back',
          moving: false,
          x: 0,
          y: 0,
        };
      }
      myPlayer = new Player(player.id, player.userName, location);
      this.players.push(myPlayer);
    }
    if (this.id !== myPlayer.id && this.physics && player.location) {
      let { sprite } = myPlayer;
      if (!sprite) {
        sprite = this.physics.add
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - JB todo
          .sprite(0, 0, 'atlas', 'misa-front')
          .setSize(30, 40)
          .setOffset(0, 24);
        const label = this.add.text(0, 0, myPlayer.userName, {
          font: '18px monospace',
          color: '#000000',
          backgroundColor: '#ffffff',
        });
        myPlayer.label = label;
        myPlayer.sprite = sprite;
      }
      if (!sprite.anims) return;
      sprite.setX(player.location.x);
      sprite.setY(player.location.y);
      myPlayer.label?.setX(player.location.x);
      myPlayer.label?.setY(player.location.y - 20);
      if (player.location.moving) {
        sprite.anims.play(`misa-${player.location.rotation}-walk`, true);
      } else {
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${player.location.rotation}`);
      }
    }
  }

  getNewMovementDirection() {
    if (this.cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this.cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this.cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this.cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  update() {
    if (this.paused) {
      return;
    }
    if (this.player && this.cursors) {
      const speed = 175;
      const prevVelocity = this.player.sprite.body.velocity.clone();
      const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);

      const primaryDirection = this.getNewMovementDirection();
      switch (primaryDirection) {
        case 'left':
          body.setVelocityX(-speed);
          this.player.sprite.anims.play('misa-left-walk', true);
          break;
        case 'right':
          body.setVelocityX(speed);
          this.player.sprite.anims.play('misa-right-walk', true);
          break;
        case 'front':
          body.setVelocityY(speed);
          this.player.sprite.anims.play('misa-front-walk', true);
          break;
        case 'back':
          body.setVelocityY(-speed);
          this.player.sprite.anims.play('misa-back-walk', true);
          break;
        default:
          // Not moving
          this.player.sprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            this.player.sprite.setTexture('atlas', 'misa-left');
          } else if (prevVelocity.x > 0) {
            this.player.sprite.setTexture('atlas', 'misa-right');
          } else if (prevVelocity.y < 0) {
            this.player.sprite.setTexture('atlas', 'misa-back');
          } else if (prevVelocity.y > 0) this.player.sprite.setTexture('atlas', 'misa-front');
          break;
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      this.player.sprite.body.velocity.normalize()
        .scale(speed);

      const isMoving = primaryDirection !== undefined;
      this.player.label.setX(body.x);
      this.player.label.setY(body.y - 20);
      if (!this.lastLocation
        || this.lastLocation.x !== body.x
        || this.lastLocation.y !== body.y
        || (isMoving && this.lastLocation.rotation !== primaryDirection)
        || this.lastLocation.moving !== isMoving) {
        if (!this.lastLocation) {
          this.lastLocation = {
            x: body.x,
            y: body.y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this.lastLocation.x = body.x;
        this.lastLocation.y = body.y;
        this.lastLocation.rotation = primaryDirection || 'front';
        this.lastLocation.moving = isMoving;
        this.emitMovement(this.lastLocation);
      }
    }
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
     tileset image in Phaser's cache (i.e. the name you used in preload)
     */
    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');
    const tileset2 = map.addTilesetImage('roguelikeIndoor_transparent32px', 'tiles2');
    const tileset3 = map.addTilesetImage('roguelikeSheet_transparent32px', 'tiles3');

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const belowLayer = map.createLayer('Below Player', [tileset, tileset2, tileset3], 0, 0);
    const worldLayer = map.createLayer('World', [tileset, tileset2, tileset3], 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = map.createLayer('Above Player', [tileset, tileset2, tileset3], 0, 0);
    /* By default, everything gets depth sorted on the screen in the order we created things.
     Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
     it a depth. Higher depths will sit on top of lower depth objects.
     */
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = map.findObject('Objects',
      (obj) => obj.name === 'Spawn Point') as unknown as
      Phaser.GameObjects.Components.Transform;


    // Find all of the transporters, add them to the physics engine
    const transporters = map.createFromObjects('Objects',
      { name: 'transporter' })
    this.physics.world.enable(transporters);

    // For each of the transporters (rectangle objects), we need to tweak their location on the scene
    // for reasons that are not obvious to me, but this seems to work. We also set them to be invisible
    // but for debugging, you can comment out that line.
    transporters.forEach(transporter => {
        const sprite = transporter as Phaser.GameObjects.Sprite;
        sprite.y += 2 * sprite.height; // Phaser and Tiled seem to disagree on which corner is y
        sprite.setVisible(false); // Comment this out to see the transporter rectangles drawn on
                                  // the map
      }
    );

    const labels = map.filterObjects('Objects',(obj)=>obj.name==='label');
    labels.forEach(label => {
      if(label.x && label.y){
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        })
      }
    });



    const cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursors.push(cursorKeys);
    this.cursors.push(this.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D
    }, false) as Phaser.Types.Input.Keyboard.CursorKeys);
    this.cursors.push(this.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.H,
      'down': Phaser.Input.Keyboard.KeyCodes.J,
      'left': Phaser.Input.Keyboard.KeyCodes.K,
      'right': Phaser.Input.Keyboard.KeyCodes.L
    }, false) as Phaser.Types.Input.Keyboard.CursorKeys);


    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24);
    const label = this.add.text(spawnPoint.x, spawnPoint.y - 20, '(You)', {
      font: '18px monospace',
      color: '#000000',
      // padding: {x: 20, y: 10},
      backgroundColor: '#ffffff',
    });
    this.player = {
      sprite,
      label
    };

    

    /* Configure physics overlap behavior for when the player steps into
    a transporter area. If you enter a transporter and press 'space', you'll
    transport to the location on the map that is referenced by the 'target' property
    of the transporter.
     */

    this.physics.add.overlap(sprite, transporters,
      async (overlappingObject, transporter)=>{

        if(cursorKeys.space.isDown && this.player){

        const hubID = transporter.getData('hubID') as number;
        const objID = transporter.getData('target') as number;

        
        if (objID === 326){

            this.setCurrentHubId(hubID);
            this.setIsPrivate(true);
          
          if(this.isAuthenticated){
            this.setIsPrivate(false);

            if(cursorKeys.space.isDown && this.player){

            const transportTargetID = transporter.getData('target') as number;
            const target = map.findObject('Objects', obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID);
            if(target && target.x && target.y && this.lastLocation){
              // Move the player to the target, update lastLocation and send it to other players
              this.player.sprite.x = target.x;
              this.player.sprite.y = target.y;
              this.lastLocation.x = target.x;
              this.lastLocation.y = target.y;
              this.emitMovement(this.lastLocation);
              
            }
            else{
              throw new Error(`Unable to find target object ${target}`);
            }
          }  
          
         }
         return;
        }
        if (objID === 338){

            this.setCurrentHubId(hubID);
            this.setIsPrivate(true);
          
          if(this.isAuthenticated){
            this.setIsPrivate(false);

            if(cursorKeys.space.isDown && this.player){

            const transportTargetID = transporter.getData('target') as number;
            const target = map.findObject('Objects', obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID);
            if(target && target.x && target.y && this.lastLocation){
              // Move the player to the target, update lastLocation and send it to other players
              this.player.sprite.x = target.x;
              this.player.sprite.y = target.y;
              this.lastLocation.x = target.x;
              this.lastLocation.y = target.y;
              this.emitMovement(this.lastLocation);
            }
            else{
              throw new Error(`Unable to find target object ${target}`);
            }
          }  
          
         }
         return;
        }
        if (objID === 341){

            this.setCurrentHubId(hubID);
            this.setIsPrivate(true);
          
          if(this.isAuthenticated){
            this.setIsPrivate(false);

            if(cursorKeys.space.isDown && this.player){

            const transportTargetID = transporter.getData('target') as number;
            const target = map.findObject('Objects', obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID);
            if(target && target.x && target.y && this.lastLocation){
              // Move the player to the target, update lastLocation and send it to other players
              this.player.sprite.x = target.x;
              this.player.sprite.y = target.y;
              this.lastLocation.x = target.x;
              this.lastLocation.y = target.y;
              this.emitMovement(this.lastLocation);
            }
            else{
              throw new Error(`Unable to find target object ${target}`);
            }
          }  
         
         }
         return;
        }
        if (objID === 314){

            this.setCurrentHubId(hubID);
            this.setIsPrivate(true);
          
          if(this.isAuthenticated){
            this.setIsPrivate(false);

            if(cursorKeys.space.isDown && this.player){

            const transportTargetID = transporter.getData('target') as number;
            const target = map.findObject('Objects', obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID);
            if(target && target.x && target.y && this.lastLocation){
              // Move the player to the target, update lastLocation and send it to other players
              this.player.sprite.x = target.x;
              this.player.sprite.y = target.y;
              this.lastLocation.x = target.x;
              this.lastLocation.y = target.y;
              this.emitMovement(this.lastLocation);
            }
            else{
              throw new Error(`Unable to find target object ${target}`);
            }
          }  
        
         }
         return;
        }
        if (objID === 315){

            this.setCurrentHubId(hubID);
            this.setIsPrivate(true);
          
          if(this.isAuthenticated){
            this.setIsPrivate(false);

            if(cursorKeys.space.isDown && this.player){

            const transportTargetID = transporter.getData('target') as number;
            const target = map.findObject('Objects', obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID);
            if(target && target.x && target.y && this.lastLocation){
              // Move the player to the target, update lastLocation and send it to other players
              this.player.sprite.x = target.x;
              this.player.sprite.y = target.y;
              this.lastLocation.x = target.x;
              this.lastLocation.y = target.y;
              this.emitMovement(this.lastLocation);
            }
            else{
              throw new Error(`Unable to find target object ${target}`);
            }
          }  
          
         }
         return;
        }
        
    if (hubID === 4 || hubID === 7 || objID === 324 || objID === 350 || objID === 352 
      || objID === 322 || objID === 319){
       const transportTargetID = transporter.getData('target') as number;
        const target = map.findObject('Objects', obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID);
        if(target && target.x && target.y && this.lastLocation){
          // Move the player to the target, update lastLocation and send it to other players
          this.player.sprite.x = target.x;
          this.player.sprite.y = target.y;
          this.lastLocation.x = target.x;
          this.lastLocation.y = target.y;
          this.emitMovement(this.lastLocation);
        }
        else{
          throw new Error(`Unable to find target object ${target}`);
        }
      }
    }
    })

    this.emitMovement({
      rotation: 'front',
      moving: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - JB todo
      x: spawnPoint.x,
      y: spawnPoint.y,
    });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(sprite, worldLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const { anims } = this;
    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-left-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-right-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);



    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move, space to transport\nCurrent town: ${this.video.townFriendlyName} (${this.video.coveyTownID})`, {
        font: '18px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.ready = true;
    if (this.players.length) {
      // Some players got added to the queue before we were ready, make sure that they have
      // sprites....
      this.players.forEach((p) => this.updatePlayerLocation(p));
    }
  }

  pause() {
    this.paused = true;
    this.previouslyCapturedKeys = this.input.keyboard.getCaptures();
    this.input.keyboard.clearCaptures();
  }

  resume() {
    this.paused = false;
    if(Video.instance()){
      // If the game is also in process of being torn down, the keyboard could be undefined
      this.input.keyboard.addCapture(this.previouslyCapturedKeys);
    }
    this.previouslyCapturedKeys = [];
  }
}



export default function WorldMap(): JSX.Element {
  const video = Video.instance();
  const {
    emitMovement, players, apiClient,currentTownID,currentTownFriendlyName
  } = useCoveyAppState();
  const toast = useToast();
  const [gameScene, setGameScene] = useState<CoveyGameScene>();
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentHubId, setCurrentHubId] = useState(0);
  const [password, setPrivatePassword] = useState('');
  const [isAuthenticated, passwordCheckDone] = useState(false);
  const [displayNewTownInfo, setNewTownCreated] = useState<boolean>(false);
  const [currentHubs, setCurrentHubsInTown] = useState<TownsList>();
  
  const updateHubListings = useCallback(async () => {
   const getAllHubs = await apiClient.listAllHubsInTown({coveyTownID:currentTownID});
     if(getAllHubs.hubs.length>0){
      setNewTownCreated(true);
      setCurrentHubsInTown({
        coveyTownID:getAllHubs.coveyTownID,
        coveyTownPassword: getAllHubs.coveyTownPassword,
        hubs:getAllHubs.hubs
      });
     }
  }, [apiClient, currentTownID]);

  useEffect(() => {
    updateHubListings();
  }, [updateHubListings]);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'map-container',
      minWidth: 800,
      minHeight: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };

    const game = new Phaser.Game(config);
    if (video) {
      const newGameScene = new CoveyGameScene(video, emitMovement,apiClient,setIsPrivate,setCurrentHubId,isAuthenticated);
      setGameScene(newGameScene);
      game.scene.add('coveyBoard', newGameScene, true);
      video.pauseGame = () => {
        newGameScene.pause();
      }
      video.unPauseGame = () => {
        newGameScene.resume();
      }
    }
    return () => {
      game.destroy(true);
    };
  }, [video, emitMovement, apiClient, passwordCheckDone, isAuthenticated]);

  const deepPlayers = JSON.stringify(players);
  useEffect(() => {
    gameScene?.updatePlayersLocations(players);
  }, [players, deepPlayers, gameScene]);

  const authenticatePassword = async (passwordSubmit: string  ) =>{

    const response=await apiClient.listHubs({coveyTownID: currentTownID,coveyHubID:currentHubId,coveyHubPassword:passwordSubmit});
    if(response.isAuthenticated){
      passwordCheckDone(true);
      setIsPrivate(false);
      toast({

        title: 'Correct Password',
        
        description: 'You can now enter the hub',
        
        status: 'success'
        
        })
    }
    else {

      toast({
      
      title: 'Incorrect Password',
      
      description: 'Please enter a correct password to access the hub.',
      
      status: 'error'
      
      });
      
      }
    };


  return (
    
      <div id="map-container">
        <Modal isOpen={displayNewTownInfo} onClose={()=>setNewTownCreated(!displayNewTownInfo)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>The details of Town created are:</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
    <List spacing={3}>
  <ListItem>
    <Table>
    <Thead>
    <Tr>
      <Th><ListIcon as={SiBandsintown} color="green.500" /> Town Id</Th>
      <Th><ListIcon as={SiBandsintown} color="green.500" /> Town Name</Th>
    </Tr>
  </Thead>
  <Tbody>
  <Tr>
    <Td>
    {currentHubs?.coveyTownID} 
    </Td>
    <Td>
    {currentTownFriendlyName}
    </Td>
  </Tr>
    </Tbody>
    </Table>
  </ListItem>
  <ListItem>
  <Table>
    <Thead>
    <Tr>
      <Th><ListIcon as={RiLockPasswordLine} color="green.500" />Town Password</Th>
    </Tr>
  </Thead>
  <Tbody>
  <Tr>
    <Td>
    {currentHubs?.coveyTownPassword}
    </Td>
  </Tr>
    </Tbody>
    </Table>
  </ListItem>
  <ListItem>
    <ListIcon as={FaRegBuilding} color="green.500" />
      The hubs are :
      <Table variant="simple">
  <Thead>
    <Tr>
      <Th><ListIcon as={RiBuilding2Line} color="green.500" />Hub Name</Th>
      <Th><ListIcon as={RiLockPasswordLine} color="green.500" />Hub Password</Th>
    </Tr>
  </Thead>
  <Tbody>
  {currentHubs?.hubs.map((hub) => (
                   <Tr key={hub.coveyHubID}>
                   
                   <Td>
                   {hub.friendlyName}
                   </Td>
                    <Td>
                    
                   {hub.coveyHubPassword}
                    </Td>
                  
                 </Tr>
                 
                  ))}
    </Tbody>
</Table>
  </ListItem>
  
</List>
    </ModalBody>

    <ModalFooter>
      <Button colorScheme="blue" mr={3} onClick={()=>setNewTownCreated(!displayNewTownInfo)}>
        OK , Noted !
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

<Modal isOpen={isPrivate} onClose={()=>setIsPrivate(!isPrivate)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Please enter password for this private Hub:</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
    <FormLabel>Password</FormLabel>
        <Input type="password" onChange={event => setPrivatePassword(event.target.value)} />
    </ModalBody>

    <ModalFooter>
      <Button colorScheme="blue" mr={3}  onClick={(ev)=>{ev.preventDefault();authenticatePassword(password)}} >
        Submit
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
        </div>
  );
}



