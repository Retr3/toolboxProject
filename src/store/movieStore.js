import { observable } from 'mobx'

const movieStore = observable({
    movieInfo: "",
    briefStar:"",
    changeMovieInfo(newMovieInfo){
      this.movieInfo = newMovieInfo;
    },
    alterBriefStar(newBriefStar){
      this.briefStar = newBriefStar;
    }
  })
  export default movieStore