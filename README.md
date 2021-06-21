# Salesforce Lightning Component: person-on-map 

This Lightning Web Component (LWC) is used to show location of an address on Google map. It has the following feature
- The address can be from any sObject like Account, Contact or even custom object. 
- The address can be standard fields, custom address fields or even GeoLocation fieids too.
- The Title, Description on the map too are completely configurable.
- You can control what data and what count of data you want to show on the map.
- Lightning Component can be used as is just by providing properties and creating Apex Class to provide data. This repository code provides sample of such apex classes.
- Component also has a Refresh button to refresh the data.
- It also allows you to subscribe to events on data change, thereby auto refreshing the data. It uses empAPI for that.

## What All Files Are There In This Repository?

- Lightning Web Component - personOnMap - This is the base component that provides the functionality. Multiple instnaces of this component can be added to a page by providing different properties.
- Apex Class - Location.cls - This apex class is wired to the lightning component to fetch data to be displayed on the map. The actual data fetching is delegated to classes that implement IMapLocationData interface.
- Apex Class - IMapLocationData.cls - Interface class that must be implemented by data class to return data to be displayed on map. Refer to sample classes for more information -  `AccountMapLocationData.cls`, `ContactMapLocationData.cls`, `ContactCurrentMapLocationData.cls`. The name of the class should match the `objectName` property. In the 3 sample files provided above, the name of `objectName` property would be `Account`, `Contact` and `ContactCurrent` respectively.
- Apex Trigger -  ContactTrigger.trigger - This is optional and is used to publish event on update of Contact record. Hence, on update of Contact, an event is published, which personOnMap component subscibes to, there by updating the data automatically without any manual intervention.

## How to use in your project

* Step 1: Add personOnMap component to your project.
* Step 2: Create a new class; give any name but it should end with `MapLocationData`. For e.g. `AccountMapLocationData` or `ContactMapLocationData`. This class should implement `IMapLocationData` interface. The method would return list of data i.e. List<SObject>
* Step 3: Add personOnMap component to your page and set the following properties
    * **objectName** - Unique identified related to data to be fetched. For e.g. if you apex class name is `AccountMapLocationData`, objectName would be `Account`. If your apex class name is `ContactCurrentMapLocationData`, objectName would be `ContactCurrent`.
    * **recordIcon** - Icon seen in the list of records.
    * **channelName** - (Optional) Channel name to subscribe to.
    * **streetFieldAPIName** - Field name related to street. For e.g. MailingStreet or BillingStreet or any other custom field.
    * **cityFieldAPIName** - Field name related to city. For e.g. MailingCity or BillingCity or any other custom field.
    * **stateFieldAPIName** - Field name related to city. For e.g. MailingState or BillingState or any other custom field.
    * **zipPostalCodeFieldAPIName** - Field name related to city. For e.g. MailingPostalCode or BillingPostalCode or any other custom field.
    * **countryFieldAPIName** - Field name related to city. For e.g. MailingCountry or BillingCountry or any other custom field.
    * **geoLatitudeFieldAPIName** - Field name related to Latitude. For e.g. any GeoLocation custom field. Refer to ContactCurrentMapLocationData.cls that uses latitude and longitude.
    * **geoLongitudeFieldAPIName** - Field name related to Longitude. For e.g. any GeoLocation custom field. Refer to ContactCurrentMapLocationData.cls that uses latitude and longitude.
    * **titleFieldAPIName** - Field name used to show Title.
    * **descriptionFieldAPIName** - Field name used to show Description.
    * **valueFieldAPIName** - Unique Id, use Record Id.
    * **showRefreshButton** - Whether to show 'Refresh' button or not. If you gave channelName, you do not need to showRefreshButton
    * **markersTitle** - Title text shown above list of all markers
    * **mapZoomLevel** - Default zoom level on component load. Valid values range from 1 to 22.

Refer to screenshot below explaining which peoperty impacts what.
![Component properties and where they impact](https://raw.githubusercontent.com/hpreets/sfdc_lightning_map/master/screenshots/personOnMap__properties.png)


* Step 4: (Optional) If you want your component to subscribe to any event i.e. if your data should refresh automatically whenever the address or lat-long changes, create an Event and mention event name in channelName property. As and when the event publishes, the personOnMap component fetches the data again.

## Screenshots

### Example 1 of 2: Show Contacts based on Mailing Address

* Contact Component UI
![Contact Component UI](https://raw.githubusercontent.com/hpreets/sfdc_lightning_map/master/screenshots/personOnMap__Contact.png)

* Contact Component Properties
![Contact Component Properties](https://raw.githubusercontent.com/hpreets/sfdc_lightning_map/master/screenshots/personOnMap__ContactProperties.png)

### Example 2 of 2: Show Contacts based on Latitude and Longitude

* Contact Current Component UI
![Contact Current Component UI](https://raw.githubusercontent.com/hpreets/sfdc_lightning_map/master/screenshots/personOnMap__ContactCurrent.png)

* Contact Current Component Properties
![Contact Current Component Properties](https://raw.githubusercontent.com/hpreets/sfdc_lightning_map/master/screenshots/personOnMap__ContactCurrentProperties.png )