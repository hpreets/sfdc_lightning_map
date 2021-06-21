public with sharing class ContactMapLocationData implements IMapLocationData {

    public List<Contact> getMapLocationData() {
        return [
            SELECT Id, FirstName, LastName, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry
            FROM Contact
            WITH SECURITY_ENFORCED
        ];
    }
}
