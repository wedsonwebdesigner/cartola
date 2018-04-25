import { HttpProvider } from './../../providers/http/http';
import { MeuTimePage } from './../meu-time/meu-time';
import { NacionalPage } from './../nacional/nacional';
import { Component } from '@angular/core';

import { LoadingController } from 'ionic-angular';
import { ModalController, PopoverController } from 'ionic-angular';

import { HistoricoPage } from '../historico/historico';
import { PartidasPage } from '../partidas/partidas';
import { NavegaroffProvider } from '../../providers/navegaroff/navegaroff';
import { PontuacaoComponent } from '../../components/pontuacao/pontuacao';
import { ConfigPage } from '../config/config';
import { ClassificacaoPage } from '../classificacao/classificacao';
import { ModalDestaquePage } from '../modal-destaque/modal-destaque';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private token;
  liga;  
  ligaoff:object; 
  filtro:String;
  rodada_atual;

  constructor(
    public loadingCtrl: LoadingController,
    public ModalController: ModalController,
    private http:HttpProvider,
    private navegaroff: NavegaroffProvider,
    private popoverCtrl: PopoverController
  )   
  {
    this.filtro = 'campeonato';
    this.ligaoff = this.navegaroff.getItem('home_liga');      
  }

  config(){
    let modal = this.ModalController.create(ConfigPage);
    modal.present();
    modal.onDidDismiss(() => this.ionViewDidLoad());
  }

  pontuacao(){
    let popover = this.popoverCtrl.create(PontuacaoComponent);
    popover.present();
  }

  partidas(){
    let modal = this.ModalController.create(PartidasPage);
    modal.present();
  }
  
  classficacao(){
    let modal = this.ModalController.create(ClassificacaoPage);
    modal.present();
  }

  historico(time){
    let modal = this.ModalController.create(HistoricoPage, { time : time, rodada_atual : this.rodada_atual.rodada });
    modal.present();
  }

  destaques(){
    let modal = this.ModalController.create(ModalDestaquePage, { times : this.liga.times, rodada_atual : this.rodada_atual.rodada });
    modal.present();
  }

  nacional(){
    let modal = this.ModalController.create(NacionalPage, { rodada_atual : this.rodada_atual });
    modal.present();
  }

  meu_time(){
    let modal = this.ModalController.create(MeuTimePage);
    modal.present();
  }

  filtrar(filtro){    
    this.liga.times.sort((a, b) => a.ranking[filtro] - b.ranking[filtro]);
  }

  ionViewDidLoad() { 
    let loading = this.loadingCtrl.create({ content: 'Por favor aguarde...' });
    loading.present();

     this.http.getApi('auth/liga/' + localStorage.getItem('liga_padrao')).subscribe(response => {
      let resposta = JSON.parse(JSON.stringify(response));

      for(let x in resposta.times)
      {
        let r = resposta.times[x].ranking;

        r.campeonato = (r.campeonato || (resposta.times.length)) 
        r.rodada = (r.rodada || (resposta.times.length)) 
        r.patrimonio = (r.patrimonio || (resposta.times.length)) 
        r.mes = (r.mes || (resposta.times.length)) 
        r.turno = (r.turno || (resposta.times.length)) 
      }
      this.liga = resposta;      
      this.navegaroff.setItem('home_liga', resposta);
      loading.dismiss();
      this.http.getApi('partidas').subscribe(response => {
        this.rodada_atual = response;
      })
      
    }, err => {
      loading.dismiss();
      this.liga = this.ligaoff;
    })    
  }

}
