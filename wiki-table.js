javascript: (function() {
    let download = function(content, fileName, mimeType) {
        let a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(new Blob([content], {
                type: mimeType
            }), fileName);
        } else if (URL && 'download' in a) {
            a.href = URL.createObjectURL(new Blob([content], {
                type: mimeType
            }));
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(content);
        }
    };

    let sanitise_filename = function(name) {
        let sanitised_name = name.toLowerCase().replace(/[\/\?<>\\:\*\|":]/g, '').replaceAll(' ', '_');
        return sanitised_name.substring(0, 251) + '.csv';
    };

    let clean_text = function(t) {
        return t.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
    };

    let css_selector_table = "table[class~='wikitable']";
    let tables = document.querySelectorAll(css_selector_table);

    for (let i = 0; i < tables.length; i++) {
        let csv_content = [];
        let table = tables[i];

        if (table.style.fontSize === '90%') {
            continue;
        }

        let csv_filename = '';
        let caption = table.querySelector("caption");

        if (caption !== null) {
            csv_filename = clean_text(caption.innerText)
        } else {
            let cur_prev_sibling = table.previousElementSibling;
            while (cur_prev_sibling.nodeName[0] != "H") {
                cur_prev_sibling = cur_prev_sibling.previousElementSibling;
            }
            let headline = cur_prev_sibling.querySelector("span[class='mw-headline']");
            csv_filename = clean_text(headline.innerText);
        }

        let headers = table.querySelectorAll('thead > tr > th');
        if (headers.length > 0) {
            headers = Array.from(headers).map(h => h.innerText).join(',');
            csv_content.push(headers);
        }

        let table_rows = table.querySelectorAll('tbody > tr');
        if (table_rows !== null) {
            for (let j = 0; j < table_rows.length; j++) {
                let row = table_rows[j].querySelectorAll('th,td');
                let content = Array.from(row).map(h => {
                    let text = h.innerText.replaceAll('"', '\'');
                    let text_array = text.split("\n");

                    if (text_array.length > 1) {
                        text = text_array.join("|");
                    }
                    return '"' + text + '"';
                });
                csv_content.push(content.join(','));
            }
        }
        if (csv_content.length > 0) {
            csv_content = csv_content.join("\r\n");
            download(csv_content, sanitise_filename(csv_filename), 'text/csv;encoding:utf-8');
        }
    }
})();