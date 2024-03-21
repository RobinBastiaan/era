<!-- First Section - since the platform does not allow larger script tags, it is split -->
//<script>
let teams = ['bevers', 'leonardus', 'parcival', 'scouts', 'explorers', 'roverscouts', 'stam', 'bestuur'];

class StaffMember {
    constructor(name, team, helpYear, staffYear, leaderYear, lastYear) {
        this.name = name;
        this.team = team;
        this.helpYear = helpYear;
        this.staffYear = staffYear;
        this.leaderYear = leaderYear;
        this.lastYear = lastYear;

        this.minYear = [helpYear, staffYear, leaderYear].filter(Boolean).reduce((a, b) => Math.min(a, b));
        this.maxYear = [helpYear, staffYear, leaderYear, lastYear ? lastYear : new Date().getFullYear()].filter(Boolean).reduce((a, b) => Math.max(a, b));
    }
}

// Build an array of StaffMembers from table data.
function getStaff() {
    let children = document.getElementById("source-table").children[0];
    let staffCount = children.childElementCount;
    let staffArray = [];

    for (let i = 1; i < staffCount; i++) {
        // validate and format input
        let valueToPush = [];
        for (let j = 0; j <= 5; j++) {
            valueToPush[j] = children.children[i].children[j].innerHTML;
            if (j === 1) {
                valueToPush[j] = valueToPush[j].toLowerCase();
                valueToPush[j] = teams.includes(valueToPush[j]) ? valueToPush[j] : 'default';
            }
            if (j > 1) valueToPush[j] = valueToPush[j].replace(/\D/g, ''); // only first two columns are not a number
        }
        let begin = Math.min(valueToPush[2] === "" ? Infinity : valueToPush[2],
            valueToPush[3] === "" ? Infinity : valueToPush[3], valueToPush[4] === "" ? Infinity : valueToPush[4]);

        // skip invalid entries
        if (!(valueToPush[2] || valueToPush[3] || valueToPush[4]) && // only if some years are entered
            !(begin < valueToPush[5] || valueToPush[5] === '')) { // and did not staff for 0 years
            continue;
        }

        let staffMember = new StaffMember(...valueToPush);
        staffArray.push(staffMember);
    }

    return staffArray;
}

function sortStaffByDate(staffArray) {
    return staffArray.sort(function (a, b) {
        let beginYearA = parseInt([a.helpYear, a.staffYear, a.leaderYear].filter(Boolean).reduce((a, b) => Math.min(a, b))),
            beginYearB = parseInt([b.helpYear, b.staffYear, b.leaderYear].filter(Boolean).reduce((a, b) => Math.min(a, b)));

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
}

// show the entire timeline of the era
function showEra() {
    let showOnlyLeaders = document.querySelector('input[name=show_only_leader]').checked;
    let showOnlyActive = document.querySelector('input[name=show_only_active]').checked;
    let displayCompact = document.querySelector('input[name=display_compact]').checked;
    let showTeams = {};
    document.querySelectorAll('#teams input[type="checkbox"]').forEach(checkbox => {
        showTeams[checkbox.name.slice(5)] = checkbox.checked; // remove "show_" part for the name of the checkbox.
    })
    let staffArray =  sortStaffByDate(getStaff());
    let minYear = new Date().getFullYear();
    let maxYear = 0;

    // calculate the min and max year to display
    let staffMatrix = [];
    let staffMatrixYears = [];
    for (let i = 0; i < staffArray.length; i++) {
        if (!shouldIncludeStaffMember(staffArray[i], showOnlyLeaders, showOnlyActive, showTeams)) {
            continue;
        }

        minYear = [minYear, staffArray[i]['helpYear'], staffArray[i]['staffYear'], staffArray[i]['leaderYear']]
            .filter(Boolean)
            .reduce((a, b) => Math.min(a, b));
        maxYear = [maxYear, staffArray[i]['staffYear'], staffArray[i]['leaderYear'], staffArray[i]['lastYear']]
            .filter(Boolean)
            .reduce((a, b) => Math.max(a, b));
        maxYear = staffArray[i]['lastYear'] ? maxYear : new Date().getFullYear(); // Take now as last year if still present.

        if (displayCompact) {
            let j = 0;
            let placeFound = false;
            while (!placeFound) {
                if (!staffMatrixYears[j] || staffMatrixYears[j] <= staffArray[i].minYear) {
                    // Extend the outer array with empty arrays until the index exists.
                    while (staffMatrix.length <= j) {
                        staffMatrix.push([]);
                    }

                    staffMatrix[j].push(staffArray[i]);
                    staffMatrixYears[j] = staffArray[i].maxYear;
                    placeFound = true;
                }

                j++;
            }
        } else {
            staffMatrix.push([staffArray[i]]);
        }
    }

    // add era div
    let eraResult = document.getElementById('era-result');
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

    eraDiv.append(...(displayStaffMembers(staffMatrix, minYear)));
    eraResult.innerHTML = '';
    eraResult.append(eraDiv);
    document.getElementById("loading-gif").style.display = 'none';
}

function shouldIncludeStaffMember(staff, showOnlyLeaders, showOnlyActive, showTeams) {
    if (showOnlyLeaders && !staff['leaderYear']) {
        return false;
    }

    if (showOnlyActive && staff['lastYear']) {
        return false;
    }

    if (!showTeams[staff['team']]) {
        return false;
    }

    return true;
}

function displayStaffMembers(staffMatrix, minYear) {
    let previousYear = minYear;
    let staffElements = [];

    for (let i = 0; i < staffMatrix.length; i++) {
        let divLine = document.createElement("div");
        divLine.style.paddingLeft = "50px";

        for (let j = 0; j < staffMatrix[i].length; j++) {
            divLine.append(showStaffMember(staffMatrix[i][j], previousYear));

            previousYear = staffMatrix[i][j].maxYear;
        }

        previousYear = minYear;
        staffElements.push(divLine);
    }

    return staffElements;
}
//</script>

<!-- Second Section -->
//<script>
// show a single staff member
function showStaffMember(staffArray, minYear) {
    let {name, team, helpYear, staffYear, leaderYear, lastYear} = staffArray;
    let begin = Math.min(helpYear === "" ? Infinity : helpYear,
        staffYear === "" ? Infinity : staffYear, leaderYear === "" ? Infinity : leaderYear);
    let ended = lastYear !== "";
    let noEndWidth = lastYear === "" ? 50 : 0;
    let stillStaffWidth = !lastYear && leaderYear === "" ? 50 : 0;
    let end = lastYear === "" ? new Date().getFullYear() : lastYear; // if not ended; take current year
    let durationHelpStaff = helpYear === "" ? 0 : (staffYear === "" ? end - helpYear : staffYear - helpYear);
    let durationStaff = staffYear === "" ? 0 : (leaderYear === "" ? end - staffYear : leaderYear - staffYear);
    let durationTeamLeader = leaderYear === "" ? 0 : end - leaderYear;

    // add div
    let staffDiv = document.createElement("div");
    staffDiv.classList.add("staff-member");
    if (!ended) staffDiv.classList.add("staff-member--no-end"); // for currently still active staff
    staffDiv.style.cssText = `margin-left: ${(begin - minYear) * 100}px;` +
        `width: ${(end - begin) * 100 - 50 + noEndWidth}px;` +
        `background: linear-gradient(to right, var(--${team}-helpstaff-color), var(--${team}-helpstaff-color) ${(durationHelpStaff) * 100}px,\n` +
        `var(--${team}-staff-color) ${(durationHelpStaff) * 100}px, var(--${team}-staff-color) ${(durationHelpStaff + durationStaff) * 100 + stillStaffWidth}px,\n` +
        `var(--${team}-teamleader-color) ${(durationHelpStaff + durationStaff) * 100 + stillStaffWidth}px, var(--${team}-teamleader-color) ${(durationHelpStaff + durationStaff + durationTeamLeader) * 100}px);`;

    // add image
    let img = document.createElement("img");
    img.classList.add("staff-member__image");
    img.src = `/src/${name}.jpg`; // PBworks: `/f/${name}.jpg or localhost: `src/${name}.jpg`
    img.onerror = function() {
        this.onerror = null;
        this.src = "/src/person.jpg"; // PBworks: `/f/${name}.jpg or localhost: `src/${name}.jpg`
    };
    img.alt = `${name}`;
    staffDiv.append(img);

    // add text
    let span = document.createElement("span");
    span.append(`${name}`);
    if (end - begin > 2) { // do not add years to text if only just started or only few years staff; and thus no space
        if (ended) {
            span.append(` (${begin} - ${end})`);
        } else { // only show begin year when no yet ended
            span.append(` (${begin})`);
        }
    }
    staffDiv.append(span);

    // add a tooltip, but only if the duration is more than 5 years
    if (durationHelpStaff + durationStaff + durationTeamLeader > 5) {
        let tooltip = document.createElement("span");
        tooltip.classList.add("staff-member__tooltip");
        let titleText = '';
        if (durationHelpStaff > 0) {
            titleText = titleText.concat(`${durationHelpStaff} jaar hulpstaf`);
            if (durationStaff > 0) titleText = titleText.concat(`, `);
        }
        if (durationStaff > 0) {
            let still = (!lastYear && leaderYear === '') ? 'al ' : ''; // still staff indicator
            titleText = titleText.concat(`${still}${durationStaff} jaar staflid`);
        }
        if (leaderYear !== '') {
            if (durationStaff > 0) titleText = titleText.concat(`, `);
            let still = (!lastYear) ? 'al ' : ''; // still teamleider indicator
            titleText = titleText.concat(`${still}${durationTeamLeader} jaar teamleider`);
        }
        tooltip.append(titleText);
        staffDiv.append(tooltip);
    }

    return staffDiv;
}

window.addEventListener('DOMContentLoaded', function () {
    if (document.getElementsByClassName('fullwidth').length === 0) {
        document.getElementById('expand-collapse-page-link')?.click()
    }

    setTimeout(showEra, 0);
});
//</script>
