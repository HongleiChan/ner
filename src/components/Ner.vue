<template>
<div>
  <el-header> <h1  align="center">实体识别</h1></el-header>
  <div style="width: 50%;margin-left: auto;margin-right: auto">
    <el-input :rows="8" type="textarea" v-model="content" placeholder="请输入内容"></el-input>
  </div>
  <div style="width: 65%;float: right;margin-top: 30px">
    <el-button type="primary" @click="onsubmit">提交</el-button>
    <el-button type="primary" @click="onempty" style="background-color: darkgray;border: 0px">清空</el-button>
  </div>

  <div class="result">
    <div class="result_child">
      <h3 style="text-align: left">结果显示：</h3>
      <div class="result_box" v-html="ner_text" style="text-align: left">
      </div>
      <div class="tips" >
        <div class="colorbox" style="background-color:#FF6600"></div>
        <span style="margin-top: 50px;margin-left: 30px;font-size: 15px;">人名</span>
        <div class="colorbox" style="background-color:#66FF66 "></div>
        <span style="margin-top: 50px;margin-left: 30px;font-size: 15px;">地名</span>
        <div class="colorbox" style="background-color:#0000FF "></div>
        <span style="margin-top: 50px;margin-left: 30px;font-size: 15px;">机构名</span>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  data(){
    return {
      content: '',
      ner_array:[],
      ner_text:''
    }
  },
  methods:{
    onsubmit(){
      if(this.content == ''){
        alert('文档输入为空，请重试')
        return;
      }

      this.$axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
        var config = err.config;
        // If config does not exist or the retry option is not set, reject
        if(!config || !config.retry) return Promise.reject(err);

        // Set the variable for keeping track of the retry count
        config.__retryCount = config.__retryCount || 0;

        // Check if we've maxed out the total number of retries
        if(config.__retryCount >= config.retry) {
          // Reject with the error
          return Promise.reject(err);
        }

        // Increase the retry count
        config.__retryCount += 1;

        // Create new promise to handle exponential backoff
        var backoff = new Promise(function(resolve) {
          setTimeout(function() {
            resolve();
          }, config.retryDelay || 1);
        });

        // Return the promise in which recalls axios to retry the request
        return backoff.then(function() {
          return axios(config);
        });
      });

      const url = "http://118.118.118.28:9046/model/entity/ner/accessToken";
      var params = {
        "content": this.content
      };
      this.$axios.post(url,params).then((res)=>{
        this.ner_array = res.data.data;
        console.log(res.data.data);
        this.Ner();
      });
    },
    onempty(){
      this.content = '';
      console.log('111');
    },
    Ner(){
      this.ner_text = this.content;
      var ends = this.ner_text.length;
      var ner_data = this.ner_array;
      for(var n=0;n<this.ner_array.length;n++){
        ner_data[n].from = Number(this.ner_array[n].end);
        ner_data[n].score = Number(this.ner_array[n].start);
      }

      ner_data.sort();
      var nersubcurrent='';
      for (var h=ner_data.length-1;h>=0;h--){
        if(h == ner_data.length-1){
          var ner_finish = this.ner_text.substring(ner_data[h].end,ends);
          nersubcurrent = ner_finish;
        }
        //不做处理的
        if(h == 0){
          var ner_undo = this.ner_text.substring(this.ner_text[0],ner_data[h].start);
        }else {
          var ner_undo = this.ner_text.substring(ner_data[h - 1].end, ner_data[h].start);
        }
        //待处理
        var ner_do = this.ner_text.substring(ner_data[h].start, ner_data[h].end);
        //存储已处理
        var ner_current = '';
        if(ner_data[h].type == 'person') {
          ner_current = '<span style="color : #FF6600;">' + ner_do + '</span>'
        }else if(ner_data[h].type == 'location'){
          ner_current = '<span style="color : #66FF66;">' + ner_do + '</span>'
        }else if(ner_data[h].type == 'organization'){
          ner_current = '<span style="color : #0000FF;">' + ner_do + '</span>'
        }
        nersubcurrent = ner_undo + ner_current + nersubcurrent;
      }
      this.ner_text = nersubcurrent;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .result{
    width: 50%;
    height: 400px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 100px;
    border: 1px #dcdfe6 solid;
    border-radius: 8px;
  }
  .result_child{
    width: 90%;
    height: 90%;
    margin-left: auto;
    margin-right: auto;
    border-radius: 8px;
  }
  .result_box{
    overflow: scroll;
    overflow-x: hidden;
    margin-top:10px;
    width: 75%;
    height: 70%;
    border: 1px #dcdfe6 solid;
    border-radius: 8px;
    float: left;
  }
  .tips{
    margin-top: 10px;
    width: 20%;
    height: 70%;
    border: 1px #dcdfe6 solid;
    border-radius: 8px;
    float: right;
  }
  .colorbox{
    width: 50%;height: 5%;border: #dcdfe6 solid 1px;border-radius: 8px; margin-top: 30px;margin-left: 30px;
  }
</style>
