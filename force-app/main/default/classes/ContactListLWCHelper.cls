public with sharing class ContactListLWCHelper {

    public static final String OBJECT_NAME = 'Contact';

    /**
     * Describes structure of the datatable
     * Key: fieldAPIName
     * Value: [0]: header label, [1]: sortable, [2]: wraptext
     * 
     * Ideally this would be from a custom metadata / custom settings.
     */
    public static Map<String, List<String>> objFieldAPIToLabelMap = new Map<String, List<String>>{
        'Salutation' => new List<String> { 'Salutation', 'false', 'false'},
        'Name' => new List<String> { 'Name', 'true', 'true'},
        'Title' => new List<String> { 'Title', 'false', 'false'},
        'AccountName__c' => new List<String> { 'Account Name', 'true', 'true'},
        'Email' => new List<String> { 'Email', 'true', 'true'},
        'Phone' => new List<String> { 'Phone', 'true', 'true'},
        'MailingAddress__c' => new List<String> { 'Mailing Address', 'true', 'false'}
    };


    /**
     * Describes details of various filters. For information on each property refer to comments on FilterDetails class.
     * 
     * Ideally this would be from a custom metadata / custom settings.
     */
    public static String getFilterDetails() {
        return '['
            + '{ "order" : "0", "name" : "title", "fieldAPIName" : "Title", "datatype" : "string", "filterDataFrom" : "soql", "soqlValueField" : "Title", "soqlLabelField" : "Title", "dataSoql" : "SELECT Title FROM Contact WHERE Title != null ORDER BY Title" }, '
            + '{ "order" : "1", "name" : "account", "fieldAPIName" : "Account.Id", "datatype" : "string", "filterDataFrom" : "soql", "soqlValueField" : "Id", "soqlLabelField" : "Name", "dataSoql" : "SELECT Id, Name FROM Account ORDER BY Name" }, '
            + '{ "order" : "2", "name" : "level", "fieldAPIName" : "Level__c", "datatype" : "string", "filterDataFrom" : "option", "options" : "Primary,Secondary,Tertiary" }, '
            + '{ "order" : "3", "name" : "leadsource", "fieldAPIName" : "LeadSource", "datatype" : "string", "filterDataFrom" : "fielddef", "objectAPIName" : "Contact" }, '
            + '{ "order" : "4", "name" : "industry", "fieldAPIName" : "Account.Industry", "datatype" : "string", "filterDataFrom" : "fielddef", "objectAPIName" : "Account" } '
        + ']';
    }


    /**
     * Returns filter details in desired format for LWC component.
     */
    @AuraEnabled(cacheable=true)
    public static String getFilterDetailsJSON() {
        List<ContactListLWCHelper.FilterDetails> filterDetailList = (List<ContactListLWCHelper.FilterDetails>) JSON.deserialize(getFilterDetails(), List<ContactListLWCHelper.FilterDetails>.class);

        JSONGenerator gen = JSON.createGenerator(true);
        gen.writeStartObject();
        for (ContactListLWCHelper.FilterDetails filterData : filterDetailList) {

            gen.writeObjectField(filterData.name, filterData);

        }
        gen.writeEndObject();
        System.debug(gen.getAsString());
        return gen.getAsString();
    }

    /**
     * Based on getFilterDetails() JSON, creates a data JSON containing all filters data. 
     * This is used by LWC to populate all filter dropdowns.
     */
    @AuraEnabled(cacheable=true)
    public static String getFiltersData() {
        List<ContactListLWCHelper.FilterDetails> filterDetailList = (List<ContactListLWCHelper.FilterDetails>) JSON.deserialize(getFilterDetails(), List<ContactListLWCHelper.FilterDetails>.class);

        JSONGenerator gen = JSON.createGenerator(true);
        gen.writeStartObject();
        for (ContactListLWCHelper.FilterDetails filterData : filterDetailList) {

            gen.writeObjectField(filterData.name, getFilterData(filterData));

        }
        gen.writeEndObject();
        System.debug(gen.getAsString());
        return gen.getAsString();
    }


    /**
     * Called from getFiltersData for each entry in getFilterDetails() JSON.
     * The filters can be generated from SOQL, hard-coded options, or from field definition
     */
    private static List<ContactListLWCHelper.FilterDataItem> getFilterData(ContactListLWCHelper.FilterDetails filterData) {
        
        if (filterData.filterDataFrom == 'soql') {
            return generateFilterDataItemsFromSOQL(filterData);
        }
        else if (filterData.filterDataFrom == 'option') {
            return generateFilterDataItemsFromOptions(filterData);
        }
        else if (filterData.filterDataFrom == 'fielddef') {
            return generateFilterDataItemsFromFieldDef(filterData);
        }
        return generateFilterDataItemsBase();
    }


    /**
     * Used as a based method for generating filter data. Adds first entry - 'All' - in filter dropdpown.
     * This method should be called from all methods that generate filter data.
     */
    private static List<ContactListLWCHelper.FilterDataItem> generateFilterDataItemsBase() {
        List<ContactListLWCHelper.FilterDataItem> fltrData = new List<ContactListLWCHelper.FilterDataItem>();
        fltrData.add(new ContactListLWCHelper.FilterDataItem('All', ''));
        return fltrData;
    }


    /**
     * This method generates filter data from SOQL. It is called from getFilterData()
     */
    private static List<ContactListLWCHelper.FilterDataItem> generateFilterDataItemsFromSOQL(ContactListLWCHelper.FilterDetails filterData) {
        List<ContactListLWCHelper.FilterDataItem> fltrData = generateFilterDataItemsBase();

        // For making sure we return only unique values.
        Set<String> uniqueFilterValues = new Set<String>();
        for (SObject sObj : Database.query(String.escapeSingleQuotes(filterData.dataSoql))) {
            if (!uniqueFilterValues.contains((String) sObj.get(filterData.soqlValueField))) {
                uniqueFilterValues.add((String) sObj.get(filterData.soqlValueField));
                fltrData.add(
                    new ContactListLWCHelper.FilterDataItem(
                        (String) sObj.get(filterData.soqlLabelField), 
                        (String) sObj.get(filterData.soqlValueField)
                    )
                );
            }
        }

        return fltrData;
    }


    /**
     * This method generates filter data from hardcoded comma-separated options. It is called from getFilterData()
     */
    private static List<ContactListLWCHelper.FilterDataItem> generateFilterDataItemsFromOptions(ContactListLWCHelper.FilterDetails filterData) {
        List<ContactListLWCHelper.FilterDataItem> fltrData = generateFilterDataItemsBase();

        for (String filterOption : filterData.options.split(',')) {
            fltrData.add(
                new ContactListLWCHelper.FilterDataItem(
                    filterOption, filterOption
                )
            );
        }

        return fltrData;
    }


    /**
     * This method generates filter data from field defintion. It is called from getFilterData()
     */
    private static List<ContactListLWCHelper.FilterDataItem> generateFilterDataItemsFromFieldDef(ContactListLWCHelper.FilterDetails filterData) {
        List<ContactListLWCHelper.FilterDataItem> fltrData = generateFilterDataItemsBase();

        String objectName = filterData.objectAPIName; // 'Contact';
            String fieldName = filterData.fieldAPIName; // 'LeadSource';
            if (fieldName.contains('.')) {
                List<String> fieldDets = fieldName.split('\\.');
                fieldName = fieldDets[fieldDets.size() - 1];
            }
              
            Schema.SObjectType s = Schema.getGlobalDescribe().get(objectName) ;
            Schema.DescribeSObjectResult r = s.getDescribe() ;
            Map<String,Schema.SObjectField> fields = r.fields.getMap() ;
            Schema.DescribeFieldResult fieldResult = fields.get(fieldName).getDescribe();
            List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            for( Schema.PicklistEntry pickListVal : ple){
                fltrData.add(
                    new ContactListLWCHelper.FilterDataItem(
                        pickListVal.getLabel(), pickListVal.getValue()
                    )
                );
            }

        return fltrData;
    }


    /**
     * Returns column details in desired format for LWC component. It returns data in following format
     * [ 
            { 
                label: "Name", 
                fieldName: "Name", 
                sortable: "true", 
                wrapText: "true" 
            },
            { label: "Account Name", fieldName: "AccountName__c", sortable: "true", wrapText: "true" },
            { 
                label: "Email", 
                fieldName: "Email", 
                type: "email", 
                sortable: "true", 
                wrapText: "true" 
            },
            { label: "Phone", fieldName: "Phone", type: "phone", sortable: "true", wrapText: "true" },
            { label: "Mailing Address", fieldName: "MailingAddress__c", sortable: "true" }
        ]
     */
    @AuraEnabled(cacheable=true)
    public static String getColumnDetails() {

        // fetch field types of all fields. Useful for special fields like Email, Phone etc.
        Map<String, String> fldTypes = getFieldTypes(objFieldAPIToLabelMap.keySet());
        
        JSONGenerator gen = JSON.createGenerator(true);
        gen.writeStartArray();

        for (String fieldName : objFieldAPIToLabelMap.keySet()) {
            gen.writeStartObject();
            gen.writeStringField('label', objFieldAPIToLabelMap.get(fieldName)[0]);
            gen.writeStringField('fieldName', fieldName);
            if (objFieldAPIToLabelMap.get(fieldName)[1] == 'true') {
                gen.writeStringField('sortable', objFieldAPIToLabelMap.get(fieldName)[1]);
            }
            if (objFieldAPIToLabelMap.get(fieldName)[2] == 'true') {
                gen.writeStringField('wrapText', objFieldAPIToLabelMap.get(fieldName)[2]);
            }

            // Convert Salesforce field type to datatype understood by lwc datatable
            String dType = retrieveFieldType(fldTypes.get(fieldName));
            if (dType != null) {
                gen.writeStringField('type', dType);
            }
            gen.writeEndObject();
        }
        gen.writeEndArray();
        return gen.getAsString();
    }

    /**
     * Returns data to be displayed on datatable in LWQ. 
     * @param sortBy : which field should it be sorted by
     * @param filters : on what value should the data be filtered. 
     * The order of the data is same as the order of the filters mentioned in getFilterDetails()
     */
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactData(String sortBy, List<String> filters) {
        System.debug('getContactData :: filters ::' + filters);
        // System.debug('getContactData :: filterAttrs ::' + filterAttrs);
        String soqlStmt = 'SELECT Id, ';
        for (String fieldName : objFieldAPIToLabelMap.keySet()) {
            soqlStmt += fieldName + ', ';
        }
        soqlStmt = soqlStmt.left(soqlStmt.length() - 2);
        soqlStmt += ' FROM ' + OBJECT_NAME;

        soqlStmt += getSOQLWhereCondition(filters);
        
        soqlStmt += ' ORDER BY ' + sortBy;
        System.debug('soqlStmt ::' + soqlStmt);
        return Database.query(soqlStmt);
    }

    /**
     * Generate WHERE condition based on filters received.
     * @param filters : on what value should the data be filtered. 
     * The order of the data is same as the order of the filters mentioned in getFilterDetails()
     */
    public static String getSOQLWhereCondition(List<String> filters) {
        List<ContactListLWCHelper.FilterDetails> filterDetailList = (List<ContactListLWCHelper.FilterDetails>) JSON.deserialize(getFilterDetails(), List<ContactListLWCHelper.FilterDetails>.class);
        if (filters != null  &&  filters.size() > 0  &&  filters.size() != filterDetailList.size()) {
            // @TODO : throw Exception
        }

        String whereSOQL = '';
        for (Integer ctr = 0; ctr < filters.size(); ctr++) {
            ContactListLWCHelper.FilterDetails filterData = filterDetailList[ctr];
            String filterVal = filters[ctr];

            if (!String.isBlank(filterVal)) {
                if (whereSOQL.length() > 0 ) {
                    whereSOQL += ' AND ';
                }
                else {
                    whereSOQL += ' WHERE ';
                }
                whereSOQL += filterData.fieldAPIName + ' = ';
                whereSOQL += addQuotesIfRequired(filterVal, filterData.dataType);
            }

        }
        return whereSOQL;
    }


    /**
     * For data purification based on different datatypes
     */
    private static String addQuotesIfRequired(String filterValue, String dataType) {
        String dType = dataType.toUpperCase();
        String filterVal = String.escapeSingleQuotes(filterValue);
        if (dType == 'STRING' || dType == 'ID') {
            return '\'' + filterVal + '\'';
        } else if (dType == 'DATE') {
            return '\'' + filterVal + '\'';
        } else if (dType == 'DATETIME') {
            return '\'' + filterVal + '\'';
        } else if (dType == 'INTEGER') {
            return filterVal;
        } else if (dType == 'BOOLEAN') {
            return filterVal;
        }
        return filterVal;
    }

    /**
     * Return Salesforce data type for fields
     * @param selectedFields : the fields for which Salesforce data type being returned
     */
    private static Map<String, String> getFieldTypes(Set<String> selectedFields) {
        Map<String, String> fieldTypeMap = new Map<String, String>();

        for (String field : selectedFields) {
            Schema.DisplayType fieldType = Schema.getGlobalDescribe().get(OBJECT_NAME).getDescribe().fields.getMap().get(field).getDescribe().getType();
            fieldTypeMap.put(field, String.valueOf(fieldType));
        }
        return fieldTypeMap;
    }


    /**
     * Convert Salesforce field type to datatype understood by lwc datatable.
     * @param dType : Salesforce data type
     * @return lwc datatable understandable datatype
     */
    private static String retrieveFieldType(String dType) {
        // String dType = String.valueOf(fieldType);
        // System.debug('retrieveFieldType :: dType ::'+ dType);
        
        if (dType == 'STRING' || dType == 'ID') {
            return null;
        } else if (dType == 'DATE') {
            return 'date';
        } else if (dType == 'DATETIME') {
            return 'datetime';
        } else if (dType == 'Integer') {
            return 'Integer';
        } else if (dType == 'BOOLEAN') {
            return 'text';
        } else if (dType == 'EMAIL') {
            return 'email';
        } else if (dType == 'PHONE') {
            return 'phone';
        }
        return null;
    }

    /* public class Filter {
        public FilterDetails title;
        public FilterDetails account;
    } */

    /**
     * Class to data for filters
     */
    public class FilterDetails {
        public String order; // filter order. This is also used while creating where condition.
        public String name; // filter identifier. This is used in LWC component while naming filter dropdowns.
        public String dataType; // data type of filter data. Currently tested only for string.
        public String fieldAPIName; // field API Name, used while searching
        public String filterDataFrom; // provide filter data from which of the 3 options - soql, option, datadef
        public String soqlValueField; // for filterDataFrom = soql, this field will become filter value. Make sure to include this field in dataSoql.
        public String soqlLabelField; // for filterDataFrom = soql, this field will become filter label. Make sure to include this field in dataSoql.
        public String dataSoql; // for filterDataFrom = soql, soql used to fetch data from which filter data is created.
        public String selectedValue { get { return ''; } set; } // used in LWC component. By default the selected value is '', meaning data not filtered.
        public String options; // for filterDataFrom = option, this contains comma separated filter values.
        public String objectAPIName; // for filterDataFrom = datadef, in which object does fieldAPIName exist
    }

    /**
     * Wrapper class for creating filter data for LWC components
     */
    public class FilterDataItem {
        public String label;
        public String value;

        public FilterDataItem(String label, String val) {
            this.label = label;
            this.value = val;
        }
    }
}

/*
ContactListLWCHelper.getFiltersData();
ContactListLWCHelper.getFilterDetailsJSON();
*/