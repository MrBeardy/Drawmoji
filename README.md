## Changelog

 1.4
-----
 * Add LZString library for string compression.
 * Add constructor options for Pixels and Row classes to accept constructor data.
 * Implement basic proof-of-concept for saving compressed pixels JSON to localStorage.

 1.3
-----
 * Optimize the mouse events methods to only add pixels for new positions to avoid running
   the same method multiple times.
 * Refactor many methods.

 1.2
-----
 * Remove all instances of the previous pixel implementation and get the new classes working.
 * Add ghostPixel method to show semi-transparent pixel for currently hovered position.

 1.1
-----
Completely rewritten the method for handling pixels. Pixels are now handled with the Pixels, Row and Pixel classes.
Using custom classes over the previous implementation with Arrays means much tighter control over the data. Previously
The "space" betweeen pixels has handled with a hacky way arrays create blank space when assigning to a key that doesn't exist;
javascript fills in all values up to that point with `undefined`, which proved to be too volatile and unpredictable.

The new system now essentially stores a hash with the Y value, that then stores a hash with the pixels, with the X position as the key.
This means that the pixels to emoji string system is now broke and will need rewriting.
