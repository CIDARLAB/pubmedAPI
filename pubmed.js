(function (pubmed) {


    //Get All Ids from a Query String
    getIdsFromPubMedRemoteAPI = function(queryString){
        var deferredIds = Q.defer();
        var ids = [];
        $.getJSON(queryString,function(data){
            deferredIds.resolve(data.esearchresult.idlist);
        });
        return deferredIds.promise;

    };

    //Get a Citation from a Query String
    getCitationFromPubMedRemoteAPI = function(queryString,idList){
        var deferredCitations = Q.defer();
        var citations = [];
        $.getJSON(queryString,function(data){
            for(var i=0;i<idList.length;i++){
                var id = idList[i];
                citations.push(data.result[id]);
            }
            deferredCitations.resolve(citations);
        });
        return deferredCitations.promise;
    };




    getAllCitationsFromPubMedRemoteAPI = function(terms, authors, database){
        var deferredAllCitations = Q.defer();
        var citations = [];
        var idList = [];
        var queryIdString = "";
        queryIdString = getIdQueryString(terms, authors, database);
        getIdsFromPubMedRemoteAPI(queryIdString).then(function(idList){
            var citationsQueryString = getCitationQueryString(idList,database);
            $.getJSON(citationsQueryString,function(citationsData){
                for(var i=0;i<idList.length;i++){
                    var id = idList[i];
                    citations.push(citationsData.result[id]);
                }
                deferredAllCitations.resolve(citations);
            });
        });

        return deferredAllCitations.promise;
    };



    //Create a Query String to get Citations
    getCitationQueryString = function(ids,db){
        var dbVal = "pubmed";
        if(typeof db !== "undefined"){
            dbVal = db;
        }
        var queryString = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?";
        queryString += ("db=" + dbVal);

        var idList = "";
        for(var i=0;i< (ids.length)-1;i++){
            idList += (ids[i] + ",");
        }
        idList += ids[ids.length-1];
        queryString += ("&id=" + idList);
        queryString += "&retmode=json";
        return queryString;
    };

    //Create a Query String to get Ids
    getIdQueryString = function(terms, authors, database){
        var queryTermString = "";
        for(var i=0;i<terms.length-1;i++){
            queryTermString += (terms[i] + ",");
        }
        var lastIndex = terms.length-1;
        queryTermString += (terms[lastIndex]);
        var queryString = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?";
        queryString += ("db=" + database +"&");
        queryString += "term=" + queryTermString;

        if(authors.length > 0){
            for(var i=0;i<authors.length;i++){
                queryString+= "," + authors[i] + "[author]";
            }
        }



        queryString += "&retmode=json";
        return queryString;
    };


    window.pubmed = pubmed.prototype = {

        getPubMedIds: function(terms, authors, database){
            var queryString = getIdQueryString(terms, authors, database);
            return getIdsFromPubMedRemoteAPI(queryString);
        },

        getCitations: function(terms, authors, database){
            return getAllCitationsFromPubMedRemoteAPI(terms, authors, database);
        },

        getCitationsFromIds: function(ids,db){
            var queryString = getCitationQueryString(ids,db);
            return getCitationFromPubMedRemoteAPI(queryString,ids);
        }

    };
}(pubmed = window.pubmed || {}));