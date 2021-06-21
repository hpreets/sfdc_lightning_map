import { api, LightningElement, track, wire } from 'lwc';
import getAddressList from '@salesforce/apex/Location.getAddressList';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { refreshApex } from '@salesforce/apex'


export default class PersonOnMap extends LightningElement {

    @api objectName;
    @api recordIcon;
    @api channelName; // = '/event/UpdateContactAddress__e';
    @api streetFieldAPIName;
    @api cityFieldAPIName;
    @api stateFieldAPIName;
    @api zipPostalCodeFieldAPIName;
    @api countryFieldAPIName;
    @api geoLatitudeFieldAPIName;
    @api geoLongitudeFieldAPIName;
    @api titleFieldAPIName;
    @api descriptionFieldAPIName;
    @api valueFieldAPIName;
    @api showRefreshButton;
    @api markersTitle;
    @api mapZoomLevel;
    

    subscription = {};

    wiredAddressListV2;
    selectedMarkerValue = 'SF1';
    listView = 'visible';
    /* mapOptions = {
        draggable: false, 
        disableDefaultUI: true
    }; */


    /* 
     * *** IMPORTANT ***
     * It is important to set some initial value other you get 
     * "this._activeCoordinate is undefined" error on component load 
     */
    @track
    mapMarkersV2 = [{
        location: {
            // Location Information
            City: 'San Francisco',
            Country: 'USA',
            PostalCode: '94105',
            State: 'CA',
            Street: '50 Fremont St',
        },

        value: 'SF1',

        // Extra info for tile in list & info window
        icon: 'standard:account',
        title: 'Julies Kitchen', // e.g. Account.Name
        description: 'This is a long description',
    }];


    /**
     * Fetches the list of SObjects to be shown on map.
     * To fetch data, 
     * 1. Create a new class with name <objectName>MapLocationData.
     * 2. Class should implement IMapLocationData interface.
     * 3. It should return List<SObject>. 
     * 
     * Refer to AccountMapLocationData.cls, ContactMapLocationData.cls or 
     * ContactCurrentMapLocationData.cls for a sample code. The <objectName> @api 
     * for the 3 sample code would be 'Account', 'Contact' and 'ContactCurrent' 
     * respectively.
     * 
     * 1. AccountMapLocationData.cls retrieves Account records and shows location on map based on BillingAddress.
     * 2. ContactMapLocationData.cls retrieves Contact records and shows location on map based on MailingAddress.
     * 3. ContactCurrentMapLocationData.cls shows how you can fetch Contact details based on custom GeoLocation fields.
     * 
     * ContactMapLocationData.cls and ContactCurrentMapLocationData.cls shows that 
     * we can show the same data but based on different properties - Address and GeoLocation
     * 
     * You can add this component multiple times on the same page and have different properties.
     * 
     * @param {List<SObject>} result 
     */
    @wire(getAddressList, {objName: '$objectName'})
    addressList(result) {
        this.wiredAddressListV2 = result; // wiredAddressListV2 is used later for refreshApex

        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.convertListToJson(null, result.data); 
        }
    };

    /**
     * Converts List<SObject> to desired JSON format, expected by lightning:map component.
     * @param {*} error 
     * @param {*} data 
     */
    convertListToJson(error, data) {
        if (data) {
            let mMarkers = []; // Stores the complete JSON.
            for (let recCtr= 0; recCtr < data.length; recCtr++) {
                let rec = data[recCtr]; // Each SObject record
                let recMarker = null; // JSON for each record.

                // Generic method to construct Location JSON - uses @api fields for that.
                recMarker = this.createLocationJSON(rec);

                if (recMarker !== null) mMarkers.push(recMarker);
            }

            // If no data is added to mMarkers, don't update it and let the default data be shown.
            if (JSON.stringify(mMarkers) !== '[]') this.mapMarkersV2 = mMarkers;
        }
        else {
            console.log('ERROR while converting data to JSON ::' + JSON.stringify(error));
        }
    }

    /**
     * Sets the selectedMarkerValue based on the selected record. 
     * event.target.selectedMarkerValue corresponds to record Id.
     * @param {*} event 
     */
    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.target.selectedMarkerValue;
    }

    /**
     * Creates JSON for each record.
     * JSON either contains Lat/Long details of Street, City, Zip, State, Country details.
     * @param {*} rec 
     * @returns JSON for each record
     */
    createLocationJSON(rec) {
        let recMarker = {};

        // Check if record contains Lat/Long details. The Lat / Long fields are from @api.
        if (this.geoLatitudeFieldAPIName != null  &&  rec[this.geoLatitudeFieldAPIName]) {
            recMarker.location = {};
            recMarker.location.Latitude = rec[this.geoLatitudeFieldAPIName];
            recMarker.location.Longitude = rec[this.geoLongitudeFieldAPIName];
        }
        // If not, then check if Street details are present. Again Address fields too are from @api
        else if (this.streetFieldAPIName !== null  &&  rec[this.streetFieldAPIName]) {
            recMarker.location = {};
            recMarker.location.Street = rec[this.streetFieldAPIName];
            recMarker.location.City = rec[this.cityFieldAPIName];
            recMarker.location.State = rec[this.stateFieldAPIName];
            recMarker.location.PostalCode = rec[this.zipPostalCodeFieldAPIName];
            recMarker.location.Country = rec[this.countryFieldAPIName];
        }
        
        // Set the remaining fields like icon, title, description.
        // If you want to show a combination of fields in title or description, 
        // create a formula field and specify that in @api
        if ((this.geoLatitudeFieldAPIName != null  &&  rec[this.geoLatitudeFieldAPIName])  
                ||  (this.streetFieldAPIName !== null  &&  rec[this.streetFieldAPIName])) {
            recMarker.value = rec[this.valueFieldAPIName];
            this.selectedMarkerValue = rec[this.valueFieldAPIName];

            recMarker.icon = this.recordIcon;
            recMarker.title = rec[this.titleFieldAPIName];
            recMarker.description = rec[this.descriptionFieldAPIName];
            return recMarker;
        }

        return null;
    }

    /**
     * Method called when an subscribed event message is received.
     * @param {*} response 
     */
    messageCallback (response) {
        console.log('New message received: ', JSON.stringify(response));
        try {
            // Perform the same functionality that "Refresh" button does.
            this.refreshButtonClick();
        }
        catch (error) {
            console.log(error);
        }
    };


    /**
     * Perform a refresh of data. It uses refreshApex functionality.
     */
    refreshButtonClick () {
        try {
            refreshApex(this.wiredAddressListV2);
        }
        catch (error) {
            console.log('Error', error);
        }
    };


    /**
     * Handles subscribe on connectedCallback event.
     * To be able to use subscribe:
     * 1. create an event like UpdateAccountAddress__e that runs "Publish After Commit"
     * 2. mention the event name in channelName @api. 
     * 3. Since we just need to refresh the records, we are not using any data from the received message.
     * 4. Refer to ContactTrigger.trigger in source code on how to publish an event.
     */
    handleSubscribe() {
        // Callback invoked whenever a new event message is received

        /*
         * *** IMPORTANT ***
         * Use the arrow, otherwise you will not be able to access methods of this class.
        */        
        const messageCallback = ((response) => {
            this.messageCallback(response);
        });

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback )
        .then(response => {
            // Response contains the subscription information on subscribe call
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response; // Used later to unsubscribe
        });
    }

    /**
     * Handles unsubscribe on disconnectedCallback event.
     */
    handleUnsubscribe() {
        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, response => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
        });
    }

    /**
     * Handle error during subscribe.
     */
    registerErrorListener() {
        // Invoke onError empApi method
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
        });
    }


    /**
     * Component Event
     */
    connectedCallback() {
        // Subscribe only if channelName is provided
        if (this.channelName !== null  &&  this.channelName !== undefined) {
            this.registerErrorListener();
            this.handleSubscribe();
        }
    }


    /**
     * Component Event
     */
     disconnectedCallback() {
        // Unsubscribe only if channelName is provided
        if (this.channelName !== null  &&  this.channelName !== undefined) {
            this.handleUnsubscribe();
        }
    }
}