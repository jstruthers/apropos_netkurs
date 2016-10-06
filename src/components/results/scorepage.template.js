const scorepageTemplate = (
  '<div class="col-xs-12">\
  <div class="scorepage">\
  \
  	<div class="header">\
  	<div class="row no-gutter">\
    <div class="col-md-4 col-md-offset-1">\
    \
  	  <h1>Astronomieksamen</h1>\
  	  \
  	 </div>\
    </div>\
    <div class="toggle-lang">Toggle Lang</div>\
  	</div>\
  	\
  <!--	RESULTS HEADER  -->\
    \
    <div class="sub-header">\
    <div class="row no-gutter">\
    \
      <div class="col-md-offset-4 col-md-4 col-sm-12">\
        <h1 class="text-center results-title">Testresultat</h1>\
      </div>\
  \
      <div class="col-md-4 col-sm-12">\
      <div class="user-time">\
  \
        <span class="username-section">\
          <span class="username-heading">Brukernavn :</span>\
          <span class="username">&nbsp;Apropos</span>\
        </span>\
  \
        <div class="clearfix"></div>\
  \
        <div class="date-section">\
          <span class="time">Tid :</span>\
          <span class="date">&nbsp;01.09.2015 - 15.12.08</span>\
        </div>\
  \
      </div>\
      </div>\
    \
    </div>\
    </div>\
  		\
  <!--		CHARTS    -->\
  \
    <div class="bars">\
    <div class="row no-gutter">\
     \
      <div class="col-md-6 col-xs-12">\
      <div class="theme-results">\
        <h2 class="theme-results-title">Oppgaver Resultat</h2>\
        <div class="theme-scores"></div>\
      </div>\
      </div>\
  \
      <div class="col-md-1 col-xs-12 text-center">\
        <span class="divider"></span>\
      </div>\
      \
      <div class="col-md-5 col-xs-12">\
      <div class="total-results">\
        <h2 class="total-title">Total</h2>\
  \
        <div class="total-bar"></div>\
  \
        <h2>\
          <span class="pass-requirement">Krav til å bestå :</span>\
          <span>&nbsp;75%</span>\
        </h2>\
      </div>\
      </div>\
  \
    </div>\
    </div>\
  \
  <!--  NAV BAR  -->\
  \
    <div class="row nav-bar">\
    <div class="col-lg-5 col-lg-push-7 col-sm-12">\
  \
        <div class="col-xs-4 text-center">\
        <button class="custom-btn nav-btn btn-quit" tabindex="0">\
          <i class="fa fa-times-circle fa-lg"></i>\
          <span class="btn-text">Avslutt</span>\
        </button>\
        </div>\
  \
        <div class="col-xs-4 text-center">\
        <button data-target="#retryModal"\
             data-toggle="modal"\
             class="custom-btn nav-btn btn-retry"\
             tabindex="0">\
          <i class="fa fa-chevron-circle-left fa-lg"></i>\
          <span class="btn-text">Prøv Igjen</span>\
        </button>\
        </div>\
  \
        <div class="col-xs-4 text-center">\
        <button data-target="#answerModal"\
             data-toggle="modal"\
             class="custom-btn nav-btn btn-answr-key"\
             tabindex="0">\
          <i class="fa fa-book fa-lg"></i>\
          <span class="btn-text">Fasit</span>\
        </button>\
        </div>\
        \
        <div id="retryModal"\
             role="dialog"\
             tabindex="-1"\
             class="modal fade"\
             aria-labelledby="retryModalLabel">\
        <div class="modal-dialog modal-sm">\
        <div class="modal-content">\
  \
          <div class="modal-header">\
            <button type="button"\
                    class="close"\
                    data-dismiss="modal"\
                    aria-hidden="true">\
              <i class="fa fa-close fa-lg"></i>\
            </button>\
            <h4 class="modal-title" id="retryModalLabel">Retry</h4>\
          </div>\
          \
          <div class="modal-body">Are you sure you want to retry?</div>\
  \
          <div class="modal-footer">\
            <button type="button"\
                    class="btn btn-primary btn-modal-cancel-retry"\
                    data-dismiss="modal">\
              <span class="btn-text">Cancel</span>\
            </button>\
            <button type="button"\
                    class="btn btn-default btn-modal-retry">\
              <span class="btn-text">Retry</span>\
            </button>\
          </div>\
  \
        </div>\
        </div>\
        </div><!-- Retry Modal -->\
  \
        <div id="answerModal"\
             role="dialog"\
             tabindex="-1"\
             class="modal fade"\
             aria-labelledby="answerModalLabel">\
        <div class="modal-dialog modal-lg">\
        <div class="modal-content">\
  \
          <div class="modal-header">\
            <button type="button"\
                    class="close"\
                    data-dismiss="modal"\
                    aria-hidden="true"><i class="fa fa-close fa-lg"></i></button>\
            <h2 class="modal-title" id="answerModalLabel">Fasit</h2>\
          </div>\
  \
          <div class="modal-body"></div>\
  \
          <div class="modal-footer">\
            <button type="button"\
                    class="btn btn-primary btn-close-modal"\
                    data-dismiss="modal">\
              <span class="btn-text">Close</span>\
            </button>\
            <button type="button"\
                    class="btn btn-default btn-print-key">\
              <span class="btn-text">Print</span>\
            </button>\
          </div>\
  \
        </div>\
        </div>\
        </div><!-- Answer Modal -->\
  \
      </div>\
  \
    </div>\
  \
  </div>\
  </div>');

export default scorepageTemplate;
