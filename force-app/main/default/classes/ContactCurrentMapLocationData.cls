public with sharing class ContactCurrentMapLocationData implements IMapLocationData {
    
    /**
     * Returns Contact data based on custom field Current_Location__c of GeoLocation type
     */
    public List<Contact> getMapLocationData() {
        return [
            SELECT Id, FirstName, LastName, Email, Phone, Current_Location__Longitude__s, Current_Location__Latitude__s
            FROM Contact
            WITH SECURITY_ENFORCED
        ];
    }
}
