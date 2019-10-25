import { observable } from 'mobx'

const movieStore = observable({
    movieInfo: "",
    changeMovieInfo(newMovieInfo){
      this.movieInfo = newMovieInfo;
    }
  })
  export default movieStore