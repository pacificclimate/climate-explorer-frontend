# Help - General

This help content is long and complexly formatted. I used LibreOffice Write
to create the content, and saved it as 

- a `.odt` file for convenient editing
- a `.html` file for copying into `HelpGeneral.js`

This procedure gives you a WYSWYG interface for writing content, and a
relatively easy (but unfortunately not painless) way to transfer that content
into the `HelpGeneral` component.

Caveats: LibreOffice introduces the following problems into the `.html` file:

- Adds `class="western"` to a lot of tags. Remove these.

- Converts lists (bulleted and numbered) to ill-formatted HTML. 
  Whoever did this should be shot on grounds of laziness and stupidity. 
  To  fix: 
  
  - Search and replace `<li/>` with `</li><li>`
  
  - Move the spurious `</li>` from the very top of each list to the bottom, 
    which closes the unclosed final list item. This could be done by a regex
    search and replace, or manually.