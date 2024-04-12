# era

See who was when a scout staff member.

## About

This small web page plugin provides a graphical representation of the history of the staff team members. With
updatability in mind, it has been made very easy for non-programmers to update the source table and add new profile
images in a wiki style way. This plugin comes with a nice hover animation on each staff member where one will see the
calculated total years a person was a staff member, and also gives the description of a theme name when present. With
the filter & sorting options at the top, one can easily retrieve the presentation they would like to see.

## Installation & Inner workings

As said, this project is build to be used on the PBworks platform. This platform does come with its quirks and
limitations that had to be built around with.

- For the CSS and the JS to work, it has to be added as a plugin on a PBworks page.
- Since the platform does not allow large plugins, the script has to be copied over in three smaller chuncks.
- When editing a PBworks page, all plugins are not executed. This allows the source table to be hidden via CSS for a
  clean and easy way for users to edit it.
- To make this project work on both the platform and the localhost, I added `<div id="wikipage-inner">` to the file.
  Since this div is already present on a PBworks page, it is not needed to copy this element over. Only the source table
  needs to be added to the page as plain HTML.
- To make images of this project work on both the platform and the localhost, there was also an `imageExists(imageUrl)`
  function to account for the difference in placement of the images. However, since it decreased performance a lot i
  have since removed it. As a consequence one will unfortunately have to change the `image src` when deploying manually.
- The images are to be uploaded to the PBworks workspace to be used by the code and the page does provide a handy link
  to where that can be done.
- Changing the colors of the various team colors should be fairly easy via the use of CSS custom properties.

## Preview

![Era](https://github.com/RobinBastiaan/era/assets/38226878/f1110288-1419-48c8-bf5b-07cd9e7e7bc0)

<p align="center" width="100%">
    <img width="10%" src="favicon.png?raw=true"> 
</p>
