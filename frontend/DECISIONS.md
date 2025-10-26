- What we are building
Book Memo (bookmemo.com) - When you read a book, you want to write down what stuck in your mind.

- yarn vs npm
Chose to keep yarn because it is from Meta, same company that maintains Reactjs

- Vite over react-scripts
React-scripts does not work with React v19

- css-in-js with emotion
Perfomence improvement: only send styles that are currently in use to the browser.
Reduce Bugs: Scoped styling helps avoid potential style overrides
Better developer expirience: Allowing developers to use css syntax directly in there Javascript code

- material ui
Developer expirience and reduction in meintainance cost.
Accessibility
Easy to customize

- src/styles/theme.js
Brand management

- redux
Make state logic more maintainable
Easy to debug 

- Using carousel (horizontal list) for search result
Take less space so that user can still see the book shelf without too much scrolling
In most cases, user will know the name of the book they are searching

- Allow users to reset cache
If they search by author and the author just released a new book (which is not in the cached result)

- react-i18next
Most popular
Straighforward API
Repo seems to be actively maintained 
