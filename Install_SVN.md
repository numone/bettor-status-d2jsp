  1. install Tortise SVN (I think requires reboot): http://tortoisesvn.net/downloads.html
  1. Go to the folder on your computer where you want to keep all this bettor status junk. make a new folder called "bettor status" or whatever you want
  1. right click the folder, there should be some cool new options you've never seen before.
    1. click on "SVN Checkout..."
    1. a dialog box will appear.
    1. url of repository is: https://bettor-status-d2jsp.googlecode.com/svn
    1. leave everything else alone and hit ok
  1. you will be prompted for a username and password.
    1. Your username is the email address you gave me (the gmail one)
    1. Your password can be found here: https://code.google.com/hosting/settings
  1. Hopefully that all worked and some files and folders are being added.
  1. From the folder you just checked out go to the lists folder. In there you can create a new text file (right click -> new -> text document)
    1. call it whatever you want for now (just want to make sure you're figuring things out)
    1. you can open it and put whatever you want inside of it
  1. when you are done having fun go back to the main folder you checked out, right click, click on "svn commit"
    1. put something in the top box, in the bottom box make sure your new text file is checked to commit and hit ok
  1. you can check to see what commits i've made to files by right clicking the checked out folder, going to tortise svn -> show log
    1. it will show you all the commits made to the branch. if you click on a specific  revision it shows you the file(s) changed. If you double click a file it will show you the change differences.

This will be our new main way of updating the list. It will keep track of who changes what and when and wont allow for overrides.