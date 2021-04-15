CoveyTown Map:

Several modifications are made to the original Covey Town map (tuxemon-town.json) to support the proposed Covey.Town features in the new map file (tuxemon-town4.json). While the original map layers design was kept to maintain compatibility with the front-end implementation, the original map was resized to support new contents that were introduced to the map, such as layouts of internal buildings and transporters. The town layout was also slightly altered to match the seven newly introduced hubs.

The new map contents include:


	
Five internal layouts for houses (private hubs): three small houses, and two large houses
	Internal layout for a school (public hub)
	Internal layout for a hospital (public hub)
	Fourteen transporters for entering and exiting the seven new hubs


A new custom property, hubID, was also added to transporter objects to support the implementation of the public and private hubs feature.



![image](https://user-images.githubusercontent.com/41226737/114893811-1247e680-9ddc-11eb-9cb6-83b4dc69af42.png)


![image](https://user-images.githubusercontent.com/41226737/114894479-aa45d000-9ddc-11eb-92c6-787a716225a5.png)
