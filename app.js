/**
 * @typedef {Object} InstantSearchOptions
 * @property {URL} searchUrl 
 * @property {string} queryParam 
 * @property {Function} responseParser 
 * @property {Function} templateFunction 
 */

class InstantSearch {
    /**
     * 
     *
     * @param {HTMLElement} instantSearch 
     * @param {InstantSearchOptions} options 
     */
    constructor(instantSearch, options) {
      this.options = options;
      this.elements = {
        main: instantSearch,
        input: instantSearch.querySelector(".instant-search__input"),
        resultsContainer: document.createElement("div")
      };
  
      this.elements.resultsContainer.classList.add(
        "instant-search__results-container"
      );
      this.elements.main.appendChild(this.elements.resultsContainer);
  
      this.addListeners();
    }
  
    /**
     * 
     */
    addListeners() {
      let delay;
  
      this.elements.input.addEventListener("input", () => {
        clearTimeout(delay);
  
        const query = this.elements.input.value;
  
        delay = setTimeout(() => {
          if (query.length < 3) {
            this.populateResults([]);
            return;
          }
  
          this.performSearch(query).then((results) => {
            this.populateResults(results);
          });
        }, 500);
      });
  
      this.elements.input.addEventListener("focus", () => {
        this.elements.resultsContainer.classList.add(
          "instant-search__results-container--visible"
        );
      });
  
      this.elements.input.addEventListener("blur", () => {
        this.elements.resultsContainer.classList.remove(
          "instant-search__results-container--visible"
        );
      });
    }
  
    /**
     *
     *
     * @param {Object[]} results
     */
    populateResults(results) {
    
      while (this.elements.resultsContainer.firstChild) {
        this.elements.resultsContainer.removeChild(
          this.elements.resultsContainer.firstChild
        );
      }
  
      for (const result of results) {
        this.elements.resultsContainer.appendChild(
          this.createResultElement(result)
        );
      }
    }
  
    /**
     *
     *
     * @param {Object} result
     * @returns {HTMLAnchorElement}
     */
    createResultElement(result) {
      const anchorElement = document.createElement("a");
  
      anchorElement.classList.add("instant-search__result");
      anchorElement.insertAdjacentHTML(
        "afterbegin",
        this.options.templateFunction(result)
      );
  
      if ("href" in result) {
        anchorElement.setAttribute("href", result.href);
      }
  
      return anchorElement;
    }
  
    /**
     * 
     *
     * @param {string} query 
     * @returns {Promise<Object[]>}
     */
    performSearch(query) {
      const url = new URL(this.options.searchUrl.toString());
  
      url.searchParams.set(this.options.queryParam, query);
  
      this.setLoading(true);
  
      return fetch(url, {
        method: "get"
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("Something went wrong with the search!");
          }
  
          return response.json();
        })
        .then((responseData) => {
          console.log(responseData);
  
          return this.options.responseParser(responseData);
        })
        .catch((error) => {
          console.error(error);
  
          return [];
        })
        .finally((results) => {
          this.setLoading(false);
  
          return results;
        });
    }
  
    /**
     * 
     *
     * @param {boolean} b 
     */
    setLoading(b) {
      this.elements.main.classList.toggle("instant-search--loading", b);
    }
  }
  
  export default InstantSearch;
  
  
  import InstantSearch from "./InstantSearch.js";
  
  const searchUsers = document.querySelector("#searchUsers");
  const instantSearchUsers = new InstantSearch(searchUsers, {
    searchUrl: new URL(
      "/projects/instant-search/search.php",
      window.location.origin
    ),
    queryParam: "q",
    responseParser: (responseData) => {
      return responseData.results;
    },
    templateFunction: (result) => {
      return `
              <div class="instant-search__title">${result.firstName} ${result.lastName}</div>
              <p class="instant-search__paragraph">${result.occupation}</p>
          `;
    }
  });
  