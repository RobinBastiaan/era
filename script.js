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
    constructor(name) {
        this.name = name;
        this.entries = [];
    }

    addEntry(entry) {
        this.entries.push(entry);
    }

    displayName(entry) {
        entry = entry ?? this.entry ?? this.entries[0];
        return entry.themeName && entry.themeName !== '&nbsp;' ? this.name + ' | ' + entry.themeName : this.name;
    }

    displayNameDescription(entry) {
        entry = entry ?? this.entry ?? this.entries[0];
        return entry.themeName && entry.themeName !== '&nbsp;' ? this.name + ' | ' + (entry.themeName ? themeNameDescription.get(entry.themeName) : '') : this.name;
    }
}

class StaffMemberEntry {
    constructor(team, themeName, helpYear, staffYear, leaderYear, lastYear, fuzzyStart, fuzzyEnd) {
        this.team = team;
        this.themeName = themeName === '&nbsp;' ? '' : themeName;
        this.helpYear = parseInt(helpYear) || null;
        this.staffYear = parseInt(staffYear) || null;
        this.leaderYear = parseInt(leaderYear) || null;
        this.lastYear = parseInt(lastYear) || null;
        this.fuzzyStart = fuzzyStart;
        this.fuzzyEnd = fuzzyEnd;

        this.minYear = parseInt([helpYear, staffYear, leaderYear].filter(Boolean).reduce((a, b) => Math.min(a, b)));
        this.maxYear = parseInt([helpYear, staffYear, leaderYear, lastYear ? lastYear : new Date().getFullYear()].filter(Boolean).reduce((a, b) => Math.max(a, b)));
    }
}

// Build an array of StaffMembers with StaffMemberEntries from table data.
function getStaff() {
    let children = document.getElementById("source-table").children[0];
    let staffCount = children.childElementCount;
    let staffArray = [];

    for (let i = 1; i < staffCount; i++) {
        // validate and format input
        let valueToPush = [];
        for (let j = 1; j <= 6; j++) {
            valueToPush[j - 1] = children.children[i].children[j].innerHTML;
            if (j === 1) {
                valueToPush[j - 1] = valueToPush[j - 1].toLowerCase();
                // Gracefully cast empty and unknown teams to 'default', so they can be displayed.
                valueToPush[j - 1] = teams.includes(valueToPush[j - 1]) ? valueToPush[j - 1] : 'default';
            }
            if (j > 2) valueToPush[j - 1] = valueToPush[j - 1].replace(/\D/g, ''); // only first three columns are not a number
        }
        let begin = Math.min(valueToPush[2] === "" ? Infinity : valueToPush[2],
            valueToPush[3] === "" ? Infinity : valueToPush[3], valueToPush[4] === "" ? Infinity : valueToPush[4]);

        // skip invalid entries
        if (!(valueToPush[2] || valueToPush[3] || valueToPush[4]) && // only if some years are entered
            !(begin < valueToPush[5] || valueToPush[5] === '')) { // and did not staff for 0 years
            console.error('The following entry was not valid: ' + children.children[i]);
            continue;
        }

        valueToPush.push(children.children[i].children[4].innerHTML.includes('~') || children.children[i].children[5].innerHTML.includes('~'));
        valueToPush.push(children.children[i].children[6].innerHTML.includes('~'));

        let staffMemberEntry = new StaffMemberEntry(...valueToPush);

        let staffMember = staffArray.find(obj => obj.name === children.children[i].children[0].innerHTML);
        if (!staffMember) {
            staffMember = new StaffMember(children.children[i].children[0].innerHTML);
            staffArray.push(staffMember);
        }

        staffMember.addEntry(staffMemberEntry);
    }

    return staffArray;
}
//</script>

//<script>//2
function sortStaffByDate(staffArray) {
    // First sort the entries of each staff member.
    staffArray = staffArray.map(staffMember => {
        staffMember.entries = staffMember.entries.sort(function (a, b) {
            return sortRules(a, b);
        });

        return staffMember;
    });

    // Then sort the staff members among themselves by their first entry.
    return staffArray.sort(function (a, b) {
        return sortRules(a.entries[0], b.entries[0]);
    });
}

function sortRules(a, b) {
    let beginYearA = [a.helpYear, a.staffYear, a.leaderYear].filter(Boolean).reduce((a, b) => Math.min(a, b)),
        beginYearB = [b.helpYear, b.staffYear, b.leaderYear].filter(Boolean).reduce((a, b) => Math.min(a, b));

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
}

// show the entire timeline of the era
function showEra() {
    let showOnlyLeaders = document.querySelector('input[name=show_only_leader]').checked;
    let showOnlyActive = document.querySelector('input[name=show_only_active]').checked;
    let displayType = document.querySelector('input[name=display]:checked').value;
    let showTeams = {};
    document.querySelectorAll('#teams input[type="checkbox"]').forEach(checkbox => {
        showTeams[checkbox.name.slice(5)] = checkbox.checked; // remove "show_" part for the name of the checkbox.
    });
    let selectedName = document.querySelector('select[name=name]').value;

    let staffArray = sortStaffByDate(filterStaff(getStaff(), showOnlyLeaders, showOnlyActive, showTeams, displayType, selectedName));
    let minYear = new Date().getFullYear();
    let maxYear = 0;

    // Split all staff members into single entries for better sorting when displaying compact.
    if (displayType === 'compact') {
        let splitArray = [];
        staffArray.forEach(staffMember => {
            staffMember.entries.forEach(entry => {
                let staffMemberToPush = new StaffMember(staffMember.name);
                staffMemberToPush.entries = [entry];
                splitArray.push(staffMemberToPush);
            });
        });

        staffArray = splitArray.sort(function (a, b) {
            return sortRules(a.entries[0], b.entries[0]);
        });
    }

    let staffMatrix = [];
    let staffMatrixYears = [];
    for (let i = 0; i < staffArray.length; i++) {
        for (let j = 0; j < staffArray[i].entries.length; j++) {
            // calculate the min and max year for the entire era-result
            minYear = [minYear, staffArray[i].entries[j]['helpYear'], staffArray[i].entries[j]['staffYear'], staffArray[i].entries[j]['leaderYear']]
                .filter(Boolean)
                .reduce((a, b) => Math.min(a, b));
            maxYear = [maxYear, staffArray[i].entries[j]['staffYear'], staffArray[i].entries[j]['leaderYear'], staffArray[i].entries[j]['lastYear']]
                .filter(Boolean)
                .reduce((a, b) => Math.max(a, b));
            maxYear = staffArray[i].entries[j]['lastYear'] ? maxYear : new Date().getFullYear(); // Take now as last year if still present.

            // Use the different display types to decide on which line a staff member should be displayed.
            if (displayType === 'compact') {
                // Try to place each next staff member on a new line when there is place.
                let k = 0;
                let placeFound = false;
                while (!placeFound) {
                    if (!staffMatrixYears[k] || staffMatrixYears[k] <= staffArray[i].entries[j].minYear) {
                        // Extend the outer array with empty arrays until the index exists.
                        while (staffMatrix.length <= k) {
                            staffMatrix.push([]);
                        }

                        staffMatrixYears[k] = staffArray[i].entries[j].maxYear;
                        placeFound = true;

                        let staffMemberToPush = new StaffMember(staffArray[i].name);
                        staffMemberToPush.entry = staffArray[i].entries[j];
                        staffMatrix[k].push(staffMemberToPush);
                    }

                    k++;
                }
            } else if (displayType === 'jungle-name') {
                // Display all staff members with the same jungle name on the same line.
                let k = 0;
                let placeFound = false;
                while (!placeFound) {
                    if (!staffMatrix[k] || staffMatrix[k][0].entry.themeName === staffArray[i].entries[j].themeName) {
                        // Extend the outer array with empty arrays until the index exists.
                        while (staffMatrix.length <= k) {
                            staffMatrix.push([]);
                        }

                        placeFound = true;

                        let staffMemberToPush = new StaffMember(staffArray[i].name);
                        staffMemberToPush.entry = staffArray[i].entries[j];
                        staffMatrix[k].push(staffMemberToPush);
                    }

                    k++;
                }
            } else {
                let staffMemberToPush = new StaffMember(staffArray[i].name);
                staffMemberToPush.entry = staffArray[i].entries[j];
                staffMatrix.push([staffMemberToPush]);
            }
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

    // fill name select
    let nameSelect = document.getElementById('names');
    staffArray.map(staff => staff.name).sort().forEach(name => {
        let option = document.createElement("option");
        option.text = name;
        option.value = name;
        nameSelect.append(option);
    });

    eraDiv.append(...(displayStaffMembers(staffMatrix, minYear)));
    eraResult.innerHTML = '';
    eraResult.append(eraDiv);
    document.getElementById("loading-gif").style.display = 'none';
}
//</script>

//<script>//3
function filterStaff(staffArray, showOnlyLeaders, showOnlyActive, showTeams, displayType, selectedName) {
    for (let i = staffArray.length - 1; i >= 0; i--) {
        if (selectedName && selectedName !== staffArray[i].name) {
            staffArray.splice(i, 1);
            continue;
        }

        for (let j = staffArray[i].entries.length - 1; j >= 0; j--) {
            if (shouldIncludeStaffEntry(staffArray[i].entries[j], showOnlyLeaders, showOnlyActive, showTeams, displayType)) {
                continue;
            }

            staffArray[i].entries.splice(j, 1);
        }

        if (staffArray[i].entries.length === 0) {
            staffArray.splice(i, 1);
        }
    }

    return staffArray;
}

function shouldIncludeStaffEntry(staffEntry, showOnlyLeaders, showOnlyActive, showTeams, displayType) {
    if (showOnlyLeaders && !staffEntry['leaderYear']) {
        return false;
    }

    if (showOnlyActive && staffEntry['lastYear']) {
        return false;
    }

    if (!showTeams[staffEntry['team']]) {
        return false;
    }

    // Filter out staffEntry without a theme name.
    if (displayType === 'jungle-name' && !staffEntry.themeName) {
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

            previousYear = staffMatrix[i][j].entry.maxYear;
        }

        previousYear = minYear;
        staffElements.push(divLine);
    }

    return staffElements;
}
//</script>

//<script>//4
// show a single staff member
function showStaffMember(staffMember, minYear) {
    let name = staffMember.name;
    let displayName = staffMember.displayName();
    let displayNameDescription = staffMember.displayNameDescription();
    let {team, helpYear, staffYear, leaderYear, lastYear, fuzzyStart, fuzzyEnd} = staffMember.entry;

    let begin = Math.min(...[helpYear, staffYear, leaderYear].filter(num => num !== null));
    let ended = !!lastYear;
    let end = lastYear ?? new Date().getFullYear(); // if not ended; take current year
    let durationHelpStaff = helpYear ? (staffYear ? staffYear - helpYear : end - helpYear) : 0;
    let durationStaff = staffYear ? (leaderYear ? leaderYear - staffYear : end - staffYear) : 0;
    let durationTeamLeader = leaderYear ? end - leaderYear : 0;
    let noEndWidth = !ended ? 50 : 0;
    let stillStaffWidth = !ended && !leaderYear ? 50 : 0;

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
        if (leaderYear) {
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
