<!-- First Section - since the platform does not allow larger script tags, it is split -->
//<script>
let minYear = new Date().getFullYear(); //getMinYear();
let maxYear = new Date().getFullYear(); //getMaxYear();

class StaffMember {
    constructor(name, helpYear, staffYear, leaderYear, lastYear) {
        this.name = name;
        this.helpYear = helpYear;
        this.staffYear = staffYear;
        this.leaderYear = leaderYear;
        this.lastYear = lastYear;
    }
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
            let staffMember = new StaffMember(...valueToPush);
            staffArray.push(staffMember);
        }

        minYear = (valueToPush[3] && valueToPush[3] < minYear) ? valueToPush[3] : minYear;
        maxYear = (valueToPush[4] && valueToPush[4] > maxYear) ? valueToPush[4] : maxYear;
    }

    staffArray.sort(function(a, b) {
        let beginYearA = a.helpYear ? a.helpYear : a.staffYear, beginYearB = b.helpYear ? b.helpYear : b.staffYear;
        if (beginYearA !== beginYearB) { // first started member first
            return (beginYearA < beginYearB) ? -1 : 1;
        } else if (!a.lastYear) { // not stopped member last
            return 1;
        } else if (!b.lastYear) { // not stopped member last
            return -1;
        } else if (a.lastYear === b.lastYear) { // same end year; no change
            return 0;
        } else { // first stopped member first
            return (a.lastYear < b.lastYear) ? -1 : 1;
        }
    });
    return staffArray;
}
//</script>

<!-- Second Section -->
//<script>
// show the entire timeline of the era
function showEra() {
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
    document.getElementById("loading-gif").style.display = 'none';
}

// check if image exists
function imageExists(imageUrl){
    var http = new XMLHttpRequest();
    http.open('HEAD', imageUrl, false);
    http.send();
    return http.status !== 404;
}
//</script>

<!-- Third Section -->
//<script>
// show a single staff member
function showStaffMember(staffArray, minYear) {
    let {name, helpYear, staffYear, leaderYear, lastYear} = staffArray;
    let begin = Math.min(helpYear === "" ? Infinity : helpYear,
        staffYear === "" ? Infinity : staffYear, leaderYear === "" ? Infinity : leaderYear);
    let ended = lastYear !== "";
    let noEndWidth = lastYear === "" ? 50 : 0;
    let stillStaffWidth = !lastYear && leaderYear === "" ? 50 : 0;
    let end = lastYear === "" ? new Date().getFullYear() : lastYear; // if not ended; take current year
    let durationHulpStaff = helpYear === "" ? 0 : (staffYear === "" ? end - staffYear : staffYear - helpYear);
    let durationStaff = staffYear === "" ? 0 : (leaderYear === "" ? end - staffYear : leaderYear - staffYear);
    let durationHopman = leaderYear === "" ? 0 : end - leaderYear;

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
    if (begin + 1 !== end) { // do not add years to text if only just started, and thus no space
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
            let still = (!lastYear && leaderYear === '') ? 'al ' : ''; // still staff indicator
            titleText = titleText.concat(`${still}${durationStaff} jaar staflid`);
        }
        if (leaderYear !== '') {
            if (durationStaff > 0) titleText = titleText.concat(`, `);
            let still = (!lastYear) ? 'al ' : ''; // still hopman indicator
            titleText = titleText.concat(`${still}${durationHopman} jaar hopman`);
        }
        tooltip.append(titleText);
        staffDiv.append(tooltip);
    }
    return staffDiv;
}

window.addEventListener('DOMContentLoaded', function() {
    setTimeout(showEra, 0);
});
//</script>
