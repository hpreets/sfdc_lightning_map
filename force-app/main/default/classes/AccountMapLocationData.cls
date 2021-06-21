public with sharing class AccountMapLocationData implements IMapLocationData {
    
    public List<Account> getMapLocationData() {
        return [
            SELECT Id, Name, Industry, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry
            FROM Account
            WITH SECURITY_ENFORCED
        ];
    }
}
