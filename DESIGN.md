**High Level Design:**

![image](https://user-images.githubusercontent.com/41226737/115065036-a63caf80-9ebb-11eb-9136-330a23a83c52.png)


**Use case Diagram:**

![image](https://user-images.githubusercontent.com/41226737/114894479-aa45d000-9ddc-11eb-92c6-787a716225a5.png)


**Sequence Diagram:**

![image](https://user-images.githubusercontent.com/41226737/114958734-a3957800-9e31-11eb-818e-2bb76644ab35.png)



**CoveyTown Map:**

Several modifications are made to the original Covey Town map (tuxemon-town.json) to support the proposed Covey.Town features in the new map file (tuxemon-town4.json). While the original map layers design was kept to maintain compatibility with the front-end implementation, the original map was resized to support new contents that were introduced to the map, such as layouts of internal buildings and transporters. The town layout was also slightly altered to match the seven newly introduced hubs.

The new map contents include:


Five internal layouts for houses (private hubs): three small houses, and two large houses
	Internal layout for a school (public hub)
	Internal layout for a hospital (public hub)
	Fourteen transporters for entering and exiting the seven new hubs


A new custom property, hubID, was also added to transporter objects to support the implementation of the public and private hubs feature.

**Back End:**

CoveyHubStore tracks all of the hubs

CoveyHubController implements the logic for each hub: managing events that can occur (eg. Creating a Hub)

CoveyTownController uses instance of CoveyHubStore to create Hubs for each town, implements logic for listing Hubs

TownServiceClient has been modified to incorporate hub info in TownCreateResponse, Request and Response for Password Authentication on Private Hubs has been added

CoveyTownRequestHandler has been modified to perform Password Authentication request

towns - new routes have been added to get and post Hub Info
	existing town route for create Town has been modified to include Hub Info



