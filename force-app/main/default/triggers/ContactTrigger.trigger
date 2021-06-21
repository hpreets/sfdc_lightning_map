trigger ContactTrigger on Contact (before insert, before update) {

    // TODO: Please use a separate class for all logic. Don't add logic to Trigger.
    List<UpdateContactAddress__e> contUpdateEventList = new List<UpdateContactAddress__e>();
    for (Contact cont : Trigger.new) {
        Contact oldCont = Trigger.oldMap.get(cont.Id);

        if (Trigger.isInsert) {
            contUpdateEventList.add(new UpdateContactAddress__e());
        }
        else if (oldCont.MailingStreet != cont.MailingStreet  
            ||  oldCont.MailingCity != cont.MailingCity
            ||  oldCont.MailingState != cont.MailingState
            ||  oldCont.MailingPostalCode != cont.MailingPostalCode
            ||  oldCont.MailingCountry != cont.MailingCountry
            ||  oldCont.Current_Locatoion__Longitude__s != cont.Current_Locatoion__Longitude__s
            ||  oldCont.Current_Locatoion__Latitude__s != cont.Current_Locatoion__Latitude__s
        ) {
            contUpdateEventList.add(new UpdateContactAddress__e());
        }
    }

    EventBus.publish(contUpdateEventList);
}