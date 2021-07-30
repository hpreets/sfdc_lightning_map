public with sharing class SubscriberLWCHelper {

    @AuraEnabled
    public static String saveSubscriber(String name, String email) {
        String retVal = 'error';
        try {
            if(Subscriber__c.SObjectType.getDescribe().isAccessible()  &&  
                    Schema.SObjectType.Subscriber__c.fields.Name.isAccessible()  &&  
                    Schema.SObjectType.Subscriber__c.fields.Subscriber_Email__c.isAccessible()) {

                Id subId = existingSubscriber(email);
                if (subId == null) {
                    return insertSubscriber(name, email);
                }
                else {
                    return updateSubscriber(subId, name, email);
                }
            }
        }
        catch (Exception e) {
            return e.getMessage();
        }
        return retVal;
    }

    private static String existingSubscriber(String email) {
        List<Subscriber__c> sList = [SELECT Id FROM Subscriber__c WHERE Subscriber_Email__c = :email];
        if (sList.size() > 0) {
            return sList[0].Id;
        }
        return null;
    }

    private static String insertSubscriber(String name, String email) {
        if (Schema.SObjectType.Subscriber__c.fields.Name.isCreateable() &&
                Schema.SObjectType.Subscriber__c.fields.Subscriber_Email__c.isCreateable()) {
            Subscriber__c sub = new Subscriber__c(Name=name, Subscriber_Email__c=email);
            Database.insert(sub);
            return 'insert';
        }
        return 'error';
    }

    private static String updateSubscriber(Id subId, String name, String email) {
        if (Schema.SObjectType.Subscriber__c.fields.Name.isUpdateable() &&
                Schema.SObjectType.Subscriber__c.fields.Subscriber_Email__c.isUpdateable()) {
            Subscriber__c sub = new Subscriber__c(Id=subId, Name=name, Subscriber_Email__c=email);
            Database.update(sub);
            return 'update';
        }
        return 'error';
    }
}