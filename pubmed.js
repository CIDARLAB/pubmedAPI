(function (pubmed) {
    function iterateJSON(idlist, publications) {
        var id = idlist.pop();
        $.getJSON('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + id + '&retmode=json', function (summary) {

            var citation = "";

            for (author in summary.result[id].authors) {
                citation += summary.result[id].authors[author].name + ', ';
            }
            citation += ' \"' + summary.result[id].title + '\" <i>' + summary.result[id].fulljournalname + '</i> ' + summary.result[id].volume + '.' + summary.result[id].issue + ' (' + summary.result[id].pubdate + '): ' + summary.result[id].pages + '.';

            console.log(citation);
            publications.push(citation);

            if (idlist.length != 0) {
                iterateJSON(idlist, publications);
            } else {
                console.log(publications);
            }
        });
    }
    window.pubmed = pubmed.prototype = {

        getIds: function () {
            $.getJSON('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=clotho,densmore[author]&retmode=json', function (data) {
                var ids = data.esearchresult.idlist;
                var publications = [];
                iterateJSON(ids, publications);
            });
        }



    };
}(pubmed = window.pubmed || {}));