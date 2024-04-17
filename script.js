//<!-- The Script for Era -->
//<!-- Since the platform does not allow large file-size within a plugins-widget, the script has to be placed in multiple smaller plugins-widgets. -->

//<script>//1
let teams = ['bevers', 'leonardus', 'parcival', 'scouts', 'explorers', 'roverscouts', 'stam', 'bestuur'];
let themeNameDescription = new Map([
    ['Akela', 'Grote grijze wolf'],
    ['Bagheera', 'Panter'],
    ['Baloe', 'Beer'],
    ['Chikai', 'Springmuis'],
    ['Chil', 'Wouw'],
    ['Chua', 'Rat'],
    ['Dahinda', 'Brulkikker'],
    ['Hathi', 'Olifant'],
    ['Ikki', 'Stekelvarken'],
    ['Jacala', 'Krokodil'],
    ['Kaa', 'Python'],
    ['Keego', 'Vis'],
    ['Ko', 'Kraai'],
    ['Limmershin', 'Winterkoninkje'],
    ['Lowie', 'Orang-Oetan'],
    ['Mang', 'Vleermuis'],
    ['Marala', 'Flamingo'],
    ['Mor', 'Pauw'],
    ['Mysa', 'Buffel'],
    ['Nag', 'Cobra'],
    ['Oe', 'Schildpad'],
    ['Oonai', 'Wolf'],
    ['Phao', 'Wolf'],
    ['Raksha', 'Moeder wolf'],
    ['Rama', 'Buffel'],
    ['Rani', 'Jonge tijger'],
    ['Rikki-tikki-tavi', 'Mangoeste'],
    ['Sahi', 'Stekelvarken'],
    ['Shada', 'Pelikaan'],
    ['Shere Khan', 'Tijger'],
    ['Sona', 'Zwarte beer'],
    ['Tabaqui', 'Jakhals'],
    ['Tark', 'Visotter'],
    ['Tha', 'Olifant'],
    ['Thuu', 'Witte Cobra'],
    ['Wontolla', 'Eenzame wolf'],
    ['Xingoe', 'Hond'],
]);

class StaffMember {
    constructor(name, team, themeName, helpYear, staffYear, leaderYear, lastYear, fuzzyStart, fuzzyEnd) {
        this.name = name;
        this.team = team;
        this.themeName = themeName;
        this.helpYear = helpYear;
        this.staffYear = staffYear;
        this.leaderYear = leaderYear;
        this.lastYear = lastYear;
        this.fuzzyStart = fuzzyStart;
        this.fuzzyEnd = fuzzyEnd;

        this.displayName = (themeName && themeName !== '&nbsp;') ? name + ' | ' + themeName : name;
        this.displayNameDescription = (themeName && themeName !== '&nbsp;') ? name + ' | ' + (themeName ? themeNameDescription.get(themeName) : '') : name;

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
        for (let j = 0; j <= 6; j++) {
            valueToPush[j] = children.children[i].children[j].innerHTML;
            if (j === 1) {
                valueToPush[j] = valueToPush[j].toLowerCase();
                valueToPush[j] = teams.includes(valueToPush[j]) ? valueToPush[j] : 'default';
            }
            if (j > 2) valueToPush[j] = valueToPush[j].replace(/\D/g, ''); // only first three columns are not a number
        }
        let begin = Math.min(valueToPush[3] === "" ? Infinity : valueToPush[3],
            valueToPush[4] === "" ? Infinity : valueToPush[4], valueToPush[5] === "" ? Infinity : valueToPush[5]);

        // skip invalid entries
        if (!(valueToPush[3] || valueToPush[4] || valueToPush[5]) && // only if some years are entered
            !(begin < valueToPush[6] || valueToPush[6] === '')) { // and did not staff for 0 years
            continue;
        }

        valueToPush.push(children.children[i].children[4].innerHTML.includes('~') || children.children[i].children[5].innerHTML.includes('~'));
        valueToPush.push(children.children[i].children[6].innerHTML.includes('~'));

        let staffMember = new StaffMember(...valueToPush);
        staffArray.push(staffMember);
    }

    return staffArray;
}
//</script>

//<script>//2
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
    let display = document.querySelector('input[name=display]:checked').value;
    let showTeams = {};
    document.querySelectorAll('#teams input[type="checkbox"]').forEach(checkbox => {
        showTeams[checkbox.name.slice(5)] = checkbox.checked; // remove "show_" part for the name of the checkbox.
    })
    let staffArray = sortStaffByDate(getStaff());
    let minYear = new Date().getFullYear();
    let maxYear = 0;

    // calculate the min and max year to display
    let staffMatrix = [];
    let staffMatrixYears = [];
    for (let i = 0; i < staffArray.length; i++) {
        if (!shouldIncludeStaffMember(staffArray[i], showOnlyLeaders, showOnlyActive, showTeams, display)) {
            continue;
        }

        minYear = [minYear, staffArray[i]['helpYear'], staffArray[i]['staffYear'], staffArray[i]['leaderYear']]
            .filter(Boolean)
            .reduce((a, b) => Math.min(a, b));
        maxYear = [maxYear, staffArray[i]['staffYear'], staffArray[i]['leaderYear'], staffArray[i]['lastYear']]
            .filter(Boolean)
            .reduce((a, b) => Math.max(a, b));
        maxYear = staffArray[i]['lastYear'] ? maxYear : new Date().getFullYear(); // Take now as last year if still present.

        if (display === 'compact') {
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
        } else if (display === 'jungle-name') {
            let j = 0;
            let placeFound = false;
            while (!placeFound) {
                if (!staffMatrix[j] || staffMatrix[j][0].themeName === staffArray[i].themeName) {
                    // Extend the outer array with empty arrays until the index exists.
                    while (staffMatrix.length <= j) {
                        staffMatrix.push([]);
                    }

                    staffMatrix[j].push(staffArray[i]);
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
//</script>

//<script>//3
function shouldIncludeStaffMember(staff, showOnlyLeaders, showOnlyActive, showTeams, display) {
    if (showOnlyLeaders && !staff['leaderYear']) {
        return false;
    }

    if (showOnlyActive && staff['lastYear']) {
        return false;
    }

    if (!showTeams[staff['team']]) {
        return false;
    }

    // Filter out staff without a theme name.
    if (display === 'jungle-name' && (!staff.themeName || staff.themeName === '&nbsp;')) {
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

//<script>//4
// show a single staff member
function showStaffMember(staffArray, minYear) {
    let {name, team, displayName, displayNameDescription, helpYear, staffYear, leaderYear, lastYear, fuzzyStart, fuzzyEnd} = staffArray;
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
    if (fuzzyStart && fuzzyEnd) {
        staffDiv.classList.add("staff-member__fuzzy-both");
        if ((minYear - begin) % 2 !== 0) {
            staffDiv.classList.add("staff-member__fuzzy-left--even");
        }
        if ((minYear - end) % 2 !== 0) {
            staffDiv.classList.add("staff-member__fuzzy-right--even");
        }
    } else if (!ended || fuzzyEnd) { // for currently still active staff
        staffDiv.classList.add("staff-member__fuzzy-right");
        if ((minYear - end) % 2 !== 0) {
            staffDiv.classList.add("staff-member__fuzzy-right--even");
        }
    } else if (fuzzyStart) {
        staffDiv.classList.add("staff-member__fuzzy-left");
        if ((minYear - begin) % 2 !== 0) {
            staffDiv.classList.add("staff-member__fuzzy-left--even");
        }
    }
    staffDiv.style.cssText = `margin-left: ${(begin - minYear) * 100}px;` +
        `width: ${(end - begin) * 100 - 50 + noEndWidth}px;` +
        `background: linear-gradient(to right, var(--${team}-helpstaff-color), var(--${team}-helpstaff-color) ${(durationHelpStaff) * 100}px,\n` +
        `var(--${team}-staff-color) ${(durationHelpStaff) * 100}px, var(--${team}-staff-color) ${(durationHelpStaff + durationStaff) * 100 + stillStaffWidth}px,\n` +
        `var(--${team}-teamleader-color) ${(durationHelpStaff + durationStaff) * 100 + stillStaffWidth}px, var(--${team}-teamleader-color) ${(durationHelpStaff + durationStaff + durationTeamLeader) * 100}px);`;

    // add image
    let img = document.createElement("img");
    img.classList.add("staff-member__image");
    img.src = `/src/${name}.jpg`; // PBworks: `/f/${name}.jpg or localhost: `src/${name}.jpg`
    img.onerror = function () {
        this.onerror = null;
        this.src = "/src/person.jpg"; // PBworks: `/f/${name}.jpg or localhost: `src/${name}.jpg`
    };
    img.alt = `${displayName}`;
    staffDiv.append(img);

    // add text
    let spanDisplayName = document.createElement("span");
    spanDisplayName.classList.add("staff-member__name");
    spanDisplayName.append(`${displayName}`);
    if (end - begin > 2) { // do not add years to text if only just started or only few years staff; and thus no space
        if (ended) {
            spanDisplayName.append(` (${begin} - ${end})`);
        } else { // only show begin year when no yet ended
            spanDisplayName.append(` (${begin})`);
        }
    }
    staffDiv.append(spanDisplayName);

    // add theme name description
    let spanDisplayNameDescription = document.createElement("span");
    spanDisplayNameDescription.classList.add("staff-member__theme-name");
    spanDisplayNameDescription.append(displayNameDescription);
    staffDiv.append(spanDisplayNameDescription);

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
//</script>

//<script>//5
window.addEventListener('DOMContentLoaded', function () {
    if (document.getElementsByClassName('fullwidth').length === 0) {
        document.getElementById('expand-collapse-page-link')?.click()
    }

    var radioButtons = document.querySelectorAll('input[name="display"]');
    for (let i = 0; i < radioButtons.length; i++) {
        radioButtons[i].addEventListener('change', () => showEra());
    }

    setTimeout(showEra, 0);
});
//</script>
