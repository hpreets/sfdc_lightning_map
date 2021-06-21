/**
 * Class that receives call from personOnMap lightning component for data.
 * The data fetch is delegated to other classes that implement IMapLocationData interface.
 * 
 */
public with sharing class Location {

    /**
     * objName parameter need not be the API Name of SObject, it is just an identifier.
     */
    @AuraEnabled(cacheable=true)
    public static List<sObject> getAddressList(String objName) {
        try {
            // Name of the class to fetch data should be <sObjAPIName>MapLocationData and should implement IMapLocationData interface.
            return ((IMapLocationData)Type.forName(objName + 'MapLocationData').newInstance()).getMapLocationData();
        }
        catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error while fetching MapLocationData for ' + objName + '. StackTrace:: ' + e.getStackTraceString());
        }
        return null;
    }
}
