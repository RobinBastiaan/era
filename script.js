<!-- First Section - since the platform does not allow larger script tags, it is split -->
//<script>
    // get the smallest starting year
    function getMinYear() {
        let minYear = Number.MAX_SAFE_INTEGER; // init
        let children = document.getElementById("source-table").children[0];
        let len = children.childElementCount;
        for (let i = 1; i < len; i++) {
            let year = parseInt(children.children[i].children[1].innerHTML); // parseInt to remove e.g. &nbsp;
            if (year < minYear) {
                minYear = year;
            }
            year = parseInt(children.children[i].children[2].innerHTML); // parseInt to remove e.g. &nbsp;
            if (year < minYear) {
                minYear = year;
            }
        }
        return minYear;
    }

    // get the biggest ending year
    function getMaxYear() {
        let maxYear = 0; // init
        let children = document.getElementById("source-table").children[0];
        let len = children.childElementCount;
        for (let i = 1; i < len; i++) {
            let year = parseInt(children.children[i].children[4].innerHTML); // parseInt to remove e.g. &nbsp;
            if (year > maxYear) {
                maxYear = year;
            }
        }
        return maxYear;
    }

    // get all staff members, and sort them
    function getStaff() {
        let children = document.getElementById("source-table").children[0];
        let len = children.childElementCount;
        let staffArray = [];
        for (let i = 1; i < len; i++) {
            let valueToPush = [];
            for (let j = 0; j <= 4; j++) {
                valueToPush[j] = children.children[i].children[j].innerHTML;
                if (j > 0) valueToPush[j] = valueToPush[j].replace(/\D/g, ''); // only first column is not a number
            }
            let begin = Math.min(valueToPush[1] === "" ? Infinity : valueToPush[1],
                valueToPush[2] === "" ? Infinity : valueToPush[2], valueToPush[3] === "" ? Infinity : valueToPush[3]);
            if ((valueToPush[1] || valueToPush[2] || valueToPush[3]) && // only if some years are entered
                (begin < valueToPush[4] || valueToPush[4] === '')) { // and did not staff for 0 years
                staffArray.push(valueToPush);
            }
        }
        staffArray.sort(compareColumn);
        return staffArray;
    }
//</script>

<!-- Second Section -->
//<script>
    // to allow sorting on the starting column
    function compareColumn(a, b) {
        let beginA = a[1] ? a[1] : a[2], beginB = b[1] ? b[1] : b[2];
        if (beginA !== beginB) { // first started member first
            return (beginA < beginB) ? -1 : 1;
        } else if (!a[4]) { // not stopped member last
            return 1;
        } else if (!b[4]) { // not stopped member last
            return -1;
        } else if (a[4] === b[4]) { // same end year; no change
            return 0;
        } else { // first stopped member first
            return (a[4] < b[4]) ? -1 : 1;
        }
    }

    // show the entire timeline of the era
    function showEra() {
        let minYear = getMinYear();
        let maxYear = getMaxYear();
        let staffArray = getStaff();

        // add era div
        let page = document.getElementById('wikipage-inner');
        let sourceTable = document.getElementById('source-table');
        let eraDiv = document.createElement("div");
        eraDiv.classList.add("era");
        eraDiv.style.width = (maxYear - minYear + 1) * 100 + "px";

        // show legend
        for (let i = minYear; i <= maxYear; i++) {
            let div = document.createElement("div");
            div.classList.add("legend");
            div.append(`${i}`);
            eraDiv.append(div);
        }

        // loop each staff member to display on page
        for (let i = 0; i < staffArray.length; i++) {
            eraDiv.append(showStaffMember(staffArray[i], minYear));
        }

        page.append(eraDiv);
    }

    // check if image exists
    function imageExists(imageUrl){
        var http = new XMLHttpRequest();
        http.open('HEAD', imageUrl, false);
        http.send();
        return http.status != 404;
    }
//</script>

<!-- Third Section -->
//<script>
    // show a single staff member
    function showStaffMember(staffArray, minYear) {
        let name = staffArray[0];
        let beginHulpStaff = staffArray[1], beginStaff = staffArray[2];
        let beginHopman = staffArray[3], rawEnd = staffArray[4];
        let begin = Math.min(beginHulpStaff === "" ? Infinity : beginHulpStaff,
            beginStaff === "" ? Infinity : beginStaff, beginHopman === "" ? Infinity : beginHopman);
        let ended = rawEnd !== "";
        let noEndWidth = rawEnd === "" ? 50 : 0;
        let stillStaffWidth = !rawEnd && beginHopman === "" ? 50 : 0;
        let end = rawEnd === "" ? new Date().getFullYear() : rawEnd; // if not ended; take current year
        let durationHulpStaff = beginHulpStaff === "" ? 0 : (beginStaff === "" ? end - beginStaff : beginStaff - beginHulpStaff);
        let durationStaff = beginStaff === "" ? 0 : (beginHopman === "" ? end - beginStaff : beginHopman - beginStaff);
        let durationHopman = beginHopman === "" ? 0 : end - beginHopman;

        // add the div
        let staffDiv = document.createElement("div");
        staffDiv.classList.add("staff-member");
        if (!ended) staffDiv.classList.add("staff-member--no-end"); // for currently still active staff
        staffDiv.style.cssText = `margin-left: ${(begin - minYear) * 100 + 50}px;` +
            `width: ${(end - begin) * 100 - 50 + noEndWidth}px;` +
            `background: linear-gradient(to right, var(--hulpstaff-color), var(--hulpstaff-color) ${(durationHulpStaff) * 100}px,\n` +
            `var(--staff-color) ${(durationHulpStaff) * 100}px, var(--staff-color) ${(durationHulpStaff + durationStaff) * 100 + stillStaffWidth}px,\n` +
            `var(--hopman-color) ${(durationHulpStaff + durationStaff) * 100 + stillStaffWidth}px, var(--hopman-color) ${(durationHulpStaff + durationStaff + durationHopman) * 100}px);`;
        // add image
        let img = document.createElement("img");
        img.classList.add("staff-member__image");
        img.src = imageExists(`/f/${name}.jpg`) ? `/f/${name}.jpg` : `src/${name}.jpg`; // PBworks or localhost
        img.alt = `${name}`;
        staffDiv.append(img);

        // add text
        let span = document.createElement("span");
        span.append(`${name}`);
        if (begin + 1 != end) {
            if (ended) {
                span.append(` (${begin} - ${end})`);
            } else { // only show begin year when no yet ended
                span.append(` (${begin})`);
            }
        }
        staffDiv.append(span);

        // add tooltip, but only if the duration is more than 5 years
        if (durationHulpStaff + durationStaff + durationHopman > 5) {
            let tooltip = document.createElement("span");
            tooltip.classList.add("staff-member__tooltip");
            let titleText = '';
            if (durationHulpStaff > 0) {
                titleText = titleText.concat(`${durationHulpStaff} jaar hulpstaf`);
                if (durationStaff > 0) titleText = titleText.concat(`, `);
            }
            if (durationStaff > 0) {
                let still = (!rawEnd && beginHopman === '') ? 'al ' : ''; // still staff indicator
                titleText = titleText.concat(`${still}${durationStaff} jaar staflid`);
            }
            if (beginHopman !== '') {
                if (durationStaff > 0) titleText = titleText.concat(`, `);
                let still = (!rawEnd) ? 'al ' : ''; // still hopman indicator
                titleText = titleText.concat(`${still}${durationHopman} jaar hopman`);
            }
            tooltip.append(titleText);
            staffDiv.append(tooltip);
        }
        return staffDiv;
    }

    window.addEventListener('DOMContentLoaded', function() {
        showEra();
        document.getElementById("loading-gif").style.display = 'none';
    });
//</script>