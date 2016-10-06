import Multichoice from './Multichoice';

export default class Checkbox extends Multichoice {

	constructor(taskData, taskId) {
		super(taskData, taskId);
		this.iconClass = 'fa fa-check-circle-o';
	}

	handleClick(index, event)
	{
		let $answerBtn = $(event.target).parents('.answer-btn').length
            ? $(event.target).parents('.answer-btn')
            : $(event.target);

	    animateClick($answerBtn);
	  
	    this.getParent().find('.optIcon span').eq(index)
	      .toggleClass( this.iconCheckedClass );

	    checkCompleted( index, this.storeTask);
	}
}
