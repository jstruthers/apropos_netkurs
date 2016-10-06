import Multichoice from './Multichoice';

export default class Radio extends Multichoice {

  constructor(taskData, taskId)
  {
    super(taskData, taskId);
    this.iconClass = 'fa fa-bullseye';
  }

  handleClick(index, event)
  {
    let $thisIcon = this.getParent().find('.optIcon span').eq(index);
    
    animateClick($thisIcon.parents('.answer-btn'));
    
    $thisIcon.addClass( this.iconCheckedClass );

    $thisIcon.parent()
      .parent()
      .siblings()
      .children('.optIcon')
      .children()
        .removeClass( this.iconCheckedClass );

    checkCompleted( index, this.storeTask );
  }
}