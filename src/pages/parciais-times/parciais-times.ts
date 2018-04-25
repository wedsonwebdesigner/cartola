import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Component, OnInit } from '@angular/core';
import { IonicPage, LoadingController, ModalController, NavParams } from 'ionic-angular';
import { HttpProvider } from '../../providers/http/http';
import { NavegaroffProvider } from '../../providers/navegaroff/navegaroff';
import { ModalParciaisTimePage } from './../modal-parciais-time/modal-parciais-time';
import { SocialSharing } from '@ionic-native/social-sharing';

@IonicPage()
@Component({
  selector: 'page-parciais-times',
  templateUrl: 'parciais-times.html',
})
export class ParciaisTimesPage {
  private liga;
  private last_updated;
  private times;
  private timesoff;
  private atletas;
  private ordem;
  private pontos_campeao;

  constructor(
    private http: HttpProvider,
    private loadingCtrl: LoadingController,
    private navegaroff: NavegaroffProvider,
    private ModalController: ModalController,    
    private socialSharing: SocialSharing,
    private Mensagem: MensagemProvider,
    private NavParams: NavParams
  ) {    
    this.liga = this.navegaroff.getItem('home_liga');
    this.timesoff = this.navegaroff.getItem('parciais_times');
    console.log(this.pontos_campeao)
  }
  
  ordenar(ordem){
    if(ordem)
    {
      for(let x in this.times)
      {
        this.ordem = true;
        this.times[x].pontuacao_total = this.times[x].pontuacao_total;
      }         
      let ordem = this.times.sort((a,b) => a.pontuacao_total > b.pontuacao_total ? -1 : 1);
      this.pontos_campeao = ordem[0].pontuacao_total;
    }
    else
    {
      for(let x in this.times)
      {
        this.ordem = false;
        this.times[x].pontuacao = this.times[x].pontuacao;
      }         
      this.times.sort((a,b) => a.pontuacao > b.pontuacao ? -1 : 1); 
      this.pontos_campeao = null;
    }  
    console.log(this.pontos_campeao);
  }

  parcial_time(time){
    let modal = this.ModalController.create(ModalParciaisTimePage, { time : time, atletas : this.atletas });
    modal.present();
  }

  compartilhar_texto(response){

    let quebra = '\n';
    let text = '*:::: ' + response.time.nome + ' ::::*' + quebra + quebra;

    let pontuacao = 0;
    for(let x in response.atletas)
    {
      let r = response.atletas[x];
      let capitao = response.capitao_id == r.atleta_id ? '*( C )* ' : '';
      text += '(' + this.atletas.posicoes[r.posicao_id].abreviacao.toUpperCase() + ') ' + capitao + r.apelido + ' ' + r.pontos_num + quebra;
      pontuacao += response.capitao_id == r.atleta_id ? (r.pontos_num * 2) : r.pontos_num;
    }

    text += quebra + '*PONTUACÃO: ' + pontuacao.toString().substr(0, pontuacao.toString().indexOf('.') + 3) + '*';
    
    this.socialSharing.shareViaWhatsApp(text, null, '').then(() => {
      // Success!
    }).catch(() => {
      this.Mensagem.mensagem('Algo deu errado', 'Verifique sua conexão com a internet!');
    });
    console.log(text, response);
  }

  compartilhar(time){
    this.http.getApi('time/slug/' + time.slug + '/' + time.rodada).subscribe(response => {
      let resposta = JSON.parse(JSON.stringify(response));
      for(let x in resposta.atletas)
      {
        let at = resposta.atletas[x];
        at.scout = (this.atletas.atletas[at.atleta_id] ? this.atletas.atletas[at.atleta_id].scout : {});
        at.pontos_num = (this.atletas.atletas[at.atleta_id] ? this.atletas.atletas[at.atleta_id].pontuacao : 0);
      }
      resposta.atletas.sort((a, b) => a.posicao_id - b.posicao_id)
      this.compartilhar_texto(resposta);
    }, err => {
      this.Mensagem.mensagem('Algo deu errado', 'Verifique sua conexão com a internet!');
    })
  }

  carregar(refresh){
    this.ionViewDidLoad(refresh);
  }

  ionViewDidLoad(refresh) {
    let loading = this.loadingCtrl.create({ content: 'Por favor aguarde...' });
    if(!refresh) loading.present();

    this.http.getApi('liga/' + this.liga.liga.liga_id + '/times').subscribe(response => {
      loading.dismiss();
      let resposta = JSON.parse(JSON.stringify(response));
      this.http.getApi('atletas/pontuados').subscribe(atletas => {
        this.times = [];        
        this.atletas = JSON.parse(JSON.stringify(atletas));
        for(let x in resposta)
        {
          let times = this.liga.times.filter(e => e.time_id == x)[0];
          times.rodada = this.atletas.rodada;
          times.pontuacao = 0;
          times.atletas_restante = 0;
          times.atleta = [];
          for(let i in resposta[x].atletas)
          {
            times.pontuacao += (this.atletas.atletas[resposta[x].atletas[i]] === undefined ? 0 : ( resposta[x].capitao == resposta[x].atletas[i] ? this.atletas.atletas[resposta[x].atletas[i]].pontuacao * 2 : this.atletas.atletas[resposta[x].atletas[i]].pontuacao)); 
            times.atletas_restante += (this.atletas.atletas[resposta[x].atletas[i]] === undefined ? 0 : 1 );
            times.atleta.push(this.atletas.atletas[resposta[x].atletas[i]]);
          }
          times.pontuacao_total = times.pontuacao + times.pontos.campeonato;
          this.times.push(times);
        } 
        
        this.times.sort((a,b) => a.pontuacao > b.pontuacao ? -1 : 1);
        this.navegaroff.setItem('hr_parciais_times', new Date());
        this.navegaroff.setItem('parciais_times', this.times);
        this.last_updated = new Date();
        if(refresh) refresh.complete();             
      }) 
    }, err => {
      this.last_updated = this.navegaroff.getItem('hr_parciais_times');
      this.times = this.timesoff;
      if(refresh) refresh.complete();
      loading.dismiss();
    })
  }

}
