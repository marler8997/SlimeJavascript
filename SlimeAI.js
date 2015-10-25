// Make sure Math.trunc is defined (for older browsers)
Math.trunc = Math.trunc || function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
}

// Assumes gravity is -1 per frame
function countFramesTillBelow(y, vy, limit) {
  for(var count = 0; 1; count++) {
    vy--;
    y += vy;
    if(y <= limit)
      return count;
  }
}

// Assumes that gameWidth, gameHeight, ball, slimeLeft and slimeRight are globals
function newSlimeAI(onLeft,name) {
  return {
    name              : name,

    onLeft            : onLeft,

    // ouptut after move
    movement          : 0, // 0=none, 1=toNet, 2=toWall
    jumpSet           : 0, // slime wants to jump

    // input to moveLogic
    meToEnemyWall     : 0, // distance from me to the enemy's wall
    enemyToTheirWall  : 0, // enemy distance to their wall

    ballToEnemyWall   : 0, // distance from ball to the enemy's wall
    ballVXToEnemyWall : 0, // ball velocity to the enemy's wall in x direction

    move : function () {
      this.jumpSet = false; // reset the jump
      if(this.onLeft) {
        this.meToEnemyWall     = gameWidth - slimeLeft.x;
        this.enemyToTheirWall  = gameWidth - slimeRight.x;

	this.ballToEnemyWall   = gameWidth - ball.x;
	this.ballVXToEnemyWall = -ball.velocityX;
	moveLogic(slimeLeft,slimeRight);
      } else {
        this.meToEnemyWall     = slimeRight.x;
        this.enemyToTheirWall  = slimeLeft.x;

	this.ballToEnemyWall   = ball.x;
	this.ballVXToEnemyWall = ball.velocityX;
	this.moveLogic(slimeRight,slimeLeft);
      }
    },

    moveLogic : null, // Move logic

    stopMovement : function() {
      this.movement = 0;
    },
    moveToNet : function() {
      //console.log('moveToNet');
      this.movement = 1;
    },
    moveToWall : function() {
      //console.log('moveToWall');
      this.movement = 2;
    },
    jump : function() {
      //console.log('jump');
      this.jumpSet = true;
    },
    calculateXWhenBallBelow : function(yLimit) {
      var frameCount = countFramesTillBelow(ball.y, ball.velocityY, yLimit);
      var toEnemyWall         = this.ballToEnemyWall;
      var velocityToEnemyWall = this.ballVXToEnemyWall;
      for(var i = 0; i < frameCount; i++) {
        toEnemyWall += velocityToEnemyWall;
	if(toEnemyWall < 0) {
	  toEnemyWall = 0;
	  velocityToEnemyWall = -velocityToEnemyWall;
	} else if(toEnemyWall > gameWidth) {
	  toEnemyWall = gameWidth;
	  velocityToEnemyWall = -velocityToEnemyWall;
	}
      }
      return toEnemyWall;
    }
  };
}
function setPatheticWhiteSlime(ai) {
  ai.state = -1;

  ai.randomJump85Percent = function() {
    if (Math.random() <= 0.85) {
      this.jump();
    }
  };

  ai.moveLogic = function(me,enemy) {

    if(this.ballToEnemyWall < 500)
      this.state = -1;
    var xWhenBallBelow125 = this.calculateXWhenBallBelow(125);
    var something;
    if(me.y > 0 && this.meToEnemyWall < 575) {
      something = 0;
    } else {
      something = 25 + Math.trunc(10 * Math.random());
    }
    //console.log('xWhenBallBelow125: ' + xWhenBallBelow125 + ', something: ' + something);
    if(this.state != -1 || (this.ballVXToEnemyWall == 0 && this.ballToEnemyWall == 800)) {
      if (this.state == -1) {
        if(this.enemyToTheirWall > 250) {
	  this.state = 0;
	} else {
	  this.state = 1;
	}
	if(Math.random() < 0.35) {
	  this.state = Math.trunc(2 * Math.random());
	}
      }
      if(this.state == 0) {
        if(ball.y < 300 && ball.velocityY < -3) {
          //console.log("moveToWall 1");
          this.moveToWall();
          this.jump();
        }
      } else if(this.state == 1) {
        if(ball.y < 300 && ball.velocityY < 0) {
          //console.log('moveToNet 1');
          this.moveToNet();
          this.jump();
        }
      }
      return;
    }

    if (xWhenBallBelow125 < 500)
    {
      if (Math.abs(this.meToEnemyWall - 666) < 20) {
        this.stopMovement();
      } else if (this.meToEnemyWall > 666) {
        //console.log('moveToNet 2');
        this.moveToNet();
      //} else if (this.meToEnemyWall < 666) {
      } else {
        //console.log("moveToWall 2");
        this.moveToWall();
      }
      return;
    }
    
    if (Math.abs(this.meToEnemyWall - xWhenBallBelow125) < something)
    {
      if (me.y != 0 || Math.random() < 0.3)
        return;

      if (
	  (this.meToEnemyWall >= 900 && this.ballToEnemyWall > 830) ||
	  (this.meToEnemyWall <= 580 && this.ballToEnemyWall < 530 && Math.abs(this.ballToEnemyWall - this.meToEnemyWall) < 100)
	  ) {
        this.randomJump85Percent();
      } else if ((Math.pow(this.ballToEnemyWall - this.meToEnemyWall, 2) * 2 + Math.pow(ball.y - me.y, 2) < 28900) &&
                 (this.ballToEnemyWall != this.meToEnemyWall)) {
        this.randomJump85Percent();
      } else if ((Math.pow(this.ballVXToEnemyWall, 2) + Math.pow(ball.velocityY, 2) < 20) &&
                 (this.ballToEnemyWall - this.meToEnemyWall < 30) &&
		 (this.ballToEnemyWall != this.meToEnemyWall)) {
        this.randomJump85Percent();
      } else if ((Math.abs(this.ballToEnemyWall - this.meToEnemyWall) < 150) &&
                 (ball.y > 50) && (ball.y < 400) && (Math.random() < 0.666)) {
        this.randomJump85Percent();
      }
    }

    if (this.state == -1) {
      if(me.y == 0) {
        if (Math.abs(this.meToEnemyWall - xWhenBallBelow125) < something) {
	  this.stopMovement();
        } else if (xWhenBallBelow125 + something < this.meToEnemyWall) {
          //console.log('moveToNet 3');
          this.moveToNet();
        } else if (xWhenBallBelow125 + something > this.meToEnemyWall) {
          //console.log("moveToWall 3");
          this.moveToWall();
        }
      } else {
        if (this.meToEnemyWall < 575) {
          return;
        }
        if (this.meToEnemyWall > 900)
        {
          //console.log("moveToWall 4");
	  this.moveToWall();
          return;
        }
        if (Math.abs(this.meToEnemyWall - this.ballToEnemyWall) < something) {
	  this.stopMovement();
        } else if (this.ballToEnemyWall < this.meToEnemyWall) {
          //console.log('moveToNet 4');
	  this.moveToNet();
        } else if (this.ballToEnemyWall > this.meToEnemyWall) {
          //console.log("moveToWall 5");
	  this.moveToWall();
        }
      }
    }

  };
}
function setAngryRedSlime(ai) {
  ai.state = -1;

  ai.randomJump40Percent = function() {
    if (Math.random() <= 0.40) {
      this.jump();
    }
  };

  ai.moveLogic = function(me,enemy) {

    if(this.ballToEnemyWall < 500)
      this.state = -1;

    var xWhenBallBelow125 = this.calculateXWhenBallBelow(125);
    var something;
    if(me.y > 0 && this.meToEnemyWall < 575) {
      something = 0;
    } else {
      something = 23 + Math.trunc(15 * Math.random());
    }
    //console.log('xWhenBallBelow125: ' + xWhenBallBelow125 + ', something: ' + something);
    if(this.state != -1 || (this.ballVXToEnemyWall == 0 && this.ballToEnemyWall == 800)) {
      if (this.state == -1) {
        if(this.enemyToTheirWall > 250) {
	  this.state = 0;
	} else if(this.enemyToTheirWall < 200) {
	  this.state = 1;
	} else if(this.enemyToTheirWall < 250) {
	  this.state = 2;
	}
	if(Math.random() < 0.35) {
	  this.state = Math.trunc(3 * Math.random());
	}
      }
      if(this.state == 0) {
        if(ball.y < 300 && ball.velocityY < -3) {
          //console.log("moveToWall 1");
          this.moveToWall();
          this.jump();
        }
      } else if(this.state == 1) {
        if(ball.y < 300 && ball.velocityY < 0) {
          //console.log('moveToNet 1');
          this.moveToNet();
          this.jump();
        }
      } else if(this.state == 2) {
        if(ball.velocityY > 12 && this.meToEnemyWall < 860) {
	  this.moveToWall();
	}
	if(this.meToEnemyWall >= 860) {
	  this.stopMovement();
	}
	if(ball.velocityY == -3 && this.meToEnemyWall != 800) {
	  this.jump();
	}
	if(ball.velocityY < -12 && me.y != 0 && this.meToEnemyWall >= 845) {
	  this.moveToNet();
	}
      }
      return;
    }

    if (xWhenBallBelow125 < 500)
    {
      if (Math.abs(this.meToEnemyWall - 800) < 20) {
        this.stopMovement();
      } else if (this.meToEnemyWall > 800) {
        //console.log('moveToNet 2');
        this.moveToNet();
      //} else if (this.meToEnemyWall < 800) {
      } else {
        //console.log("moveToWall 2");
        this.moveToWall();
      }
      return;
    }
    
    if (Math.abs(this.meToEnemyWall - xWhenBallBelow125) < something)
    {
      if (me.y != 0 || Math.random() < 0.3)
        return;

      if (
	  (this.meToEnemyWall >= 900 && this.ballToEnemyWall > 830) ||
	  (this.meToEnemyWall <= 580 && this.ballToEnemyWall < 530 && Math.abs(this.ballToEnemyWall - this.meToEnemyWall) < 100)
	  ) {
        this.randomJump40Percent();
      } else if ((Math.pow(this.ballToEnemyWall - this.meToEnemyWall, 2) * 2 + Math.pow(ball.y - me.y, 2) < 28900) &&
                 (this.ballToEnemyWall != this.meToEnemyWall)) {
        this.randomJump40Percent();
      } else if ((Math.pow(this.ballVXToEnemyWall, 2) + Math.pow(ball.velocityY, 2) < 20) &&
                 (this.ballToEnemyWall - this.meToEnemyWall < 30) &&
		 (this.ballToEnemyWall != this.meToEnemyWall)) {
        this.randomJump40Percent();
      } else if ((Math.abs(this.ballToEnemyWall - this.meToEnemyWall) < 150) &&
                 (ball.y > 50) && (ball.y < 400) && (Math.random() < 0.5)) {
        this.randomJump40Percent();
      }
    }

    if (this.state == -1) {
      if(me.y == 0) {
        if (Math.abs(this.meToEnemyWall - xWhenBallBelow125) < something) {
	  this.stopMovement();
        } else if (xWhenBallBelow125 + something < this.meToEnemyWall) {
          //console.log('moveToNet 3');
          this.moveToNet();
        } else if (xWhenBallBelow125 + something > this.meToEnemyWall) {
          //console.log("moveToWall 3");
          this.moveToWall();
        }
      } else {
        if (this.meToEnemyWall < 575) {
          return;
        }
        if (this.meToEnemyWall > 900)
        {
          //console.log("moveToWall 4");
	  this.moveToWall();
          return;
        }
        if (Math.abs(this.meToEnemyWall - this.ballToEnemyWall) < something) {
	  this.stopMovement();
        } else if (this.ballToEnemyWall < this.meToEnemyWall) {
          //console.log('moveToNet 4');
	  this.moveToNet();
        } else if (this.ballToEnemyWall > this.meToEnemyWall) {
          //console.log("moveToWall 5");
	  this.moveToWall();
        }
      }
    }

  };
}
function setMasterSlime(ai) {
  ai.state = -1;

  ai.randomJump40Percent = function() {
    if (Math.random() <= 0.40) {
      this.jump();
    }
  };
  ai.ballXWhenBelow = function(yLimit) {
    var toEnemyWall         = this.ballToEnemyWall;
    var velocityToEnemyWall = this.ballVXToEnemyWall;
    var ballY = ball.y;
    var ballVelocityY = ball.velocityY;
    while(1) {
      ballVelocityY--;
      ballY += ballVelocityY;
      if(ballY <= yLimit)
        return toEnemyWall;
      toEnemyWall += velocityToEnemyWall;
      if(toEnemyWall <= 0) {
        toEnemyWall = 0;
	velocityToEnemyWall = - velocityToEnemyWall;
      } else if(toEnemyWall >= 1000) {
        toEnemyWall = 1000;
	velocityToEnemyWall = - velocityToEnemyWall;
      }
    }
  }
  ai.performServe = function(me) {
    if(this.state == -1) {
      if(Math.random() < 0.3) {
        if(this.enemyToTheirWall < 30) {
	  this.state = 0;
	} else if(this.enemyToTheirWall > 200) {
	  this.state = 1;
	} else {
	  this.state = 2;
	}
      } else {
        this.state = 2;
      }
      if(Math.random() < 0.3) {
        this.state = Math.trunc(Math.random()*3);
      }
    }

    if(this.state == 0 || this.state == 1) {
      var j = (this.state == 0) ? 860 : 840;
      if(ball.velocityY > 12 && this.meToEnemyWall < j) {
        this.moveToWall();
      }
      if(this.meToEnemyWall > j) {
        this.stopMovement();
      }
      if(ball.velocityY == -3 && this.meToEnemyWall != 800) {
        this.jump();
      }
      if(this.state == 0 && ball.velocityY < -12 && me.y != 0 && this.meToEnemyWall >= j-15) {
        this.moveToNet();
      }
      if(this.ballToEnemyWall < 700) {
        this.state = -1;
      }
    } else if(this.state == 2) {
      var limit = 770;
      if (ball.velocityY > 12 && this.meToEnemyWall > limit) {
        this.moveToNet();
      }
      if (this.meToEnemyWall <= limit) {
        this.stopMovement();
      }
      if (ball.velocityY == -2 && this.meToEnemyWall != 800) {
        this.jump();
      }
      if (me.y != 0 && this.ballToEnemyWall > 800) {
        this.state = 3;
	var prob;
	if(this.enemyToTheirWall < 200) {
	  prob = 0.7;
	} else if(this.enemyToTheirWall > 300) {
	  prob = 0.3;
	} else {
	  prob = 0.5;
	}
	if(Math.random() < prob) {
	  this.state++;
	}
      }
    } else if(this.state == 3) {
      var limit = 585;
      if (this.meToEnemyWall > limit) {
        this.moveToNet();
      }
      if (this.meToEnemyWall <= limit) {
        this.stopMovement();
      }
      if (this.ballToEnemyWall <= 730) {
        this.jump();
      }
      if (this.ballToEnemyWall < 540) {
        this.state = -1;
      }
    } else if(this.state == 4) {
      var limit = 585;
      if (this.meToEnemyWall > limit) {
        this.moveToNet();
      }
      if (this.meToEnemyWall <= limit) {
        this.stopMovement();
      }
      if (this.ballToEnemyWall <= 730) {
        this.jump();
      }
      if (this.ballToEnemyWall < 600) {
        this.moveToWall();
      }
      if (this.ballToEnemyWall < 580) {
        this.stopMovement();
      }
      if (this.ballToEnemyWall < 540) {
        this.state = -1;
      }
    }
  }
  ai.moveLogic = function(me,enemy) {

    if(this.state != -1 || (this.ballToEnemyWall == 800 && this.ballVXToEnemyWall == 0)) {
      this.performServe(me);
      return;
    }
    if(this.ballToEnemyWall < 500)
      this.state = -1;

    var xWhenBallBelowMe = this.ballXWhenBelow(me.y + me.velocityY + 30);

    var something;
    if(xWhenBallBelowMe < 600) {
      something = 0;
    } else if(xWhenBallBelowMe < 700) {
      something = 10;
    } else {
      something = 20;
    }

    if(xWhenBallBelowMe < 450) {
      if (Math.abs(this.meToEnemyWall - 666) < 10) {
        this.stopMovement();
      } else if (666 < this.meToEnemyWall) {
        this.moveToNet();
      } else if (666 > this.meToEnemyWall) {
        this.moveToWall();
      }
    } else if (Math.abs(this.meToEnemyWall - xWhenBallBelowMe - something) < 10) {
      this.stopMovement();
    } else if (xWhenBallBelowMe + something < this.meToEnemyWall) {
      this.moveToNet();
    } else if (xWhenBallBelowMe + something > this.meToEnemyWall) {
      this.moveToWall();
    }

    if ( (this.meToEnemyWall <= 900 || Math.random() >= 0.4) &&
         xWhenBallBelowMe >= 620 &&
	 (ball.y >= 130 || ball.velocityY >= 0) &&
	 (Math.random() >= 0.6)) {

      if ((this.meToEnemyWall >= 900 && this.ballToEnemyWall > 830) ||
          (this.meToEnemyWall <= 580 && this.ballToEnemyWall < 530 &&
	     Math.abs(this.ballToEnemyWall - this.meToEnemyWall) < 100)) {
        this.jump();
      } else if (this.ballToEnemyWall != this.meToEnemyWall && 
        Math.pow(this.ballToEnemyWall - this.meToEnemyWall,2) * 2 + Math.pow(ball.y - me.y,2) < Math.pow(185,2)) {
        this.jump();
      } else if (this.ballToEnemyWall != this.meToEnemyWall &&
        this.ballVXToEnemyWall * this.ballVXToEnemyWall + ball.velocityY * ball.velocityY < 20 &&
        this.ballToEnemyWall - this.meToEnemyWall < 30) {
        this.jump();
      } else if (Math.abs(this.ballToEnemyWall - this.meToEnemyWall) < 150) {
        if ((ball.y > 50) && (ball.y < 250)) {
          this.jump();
        }
      }
    }
  };
}

var slimeAIs = [
    {name:"Pathetic White Slime",
     color:'#fff',
     backImageName:'sky',
     legacySkyColor:'#00f',
     legacyGroundColor:'#888',
     legacyBallColor:'#ff0',
     newGroundColor:'#ca6',
     backTextColor:'#000',
     //initAI:setMasterSlime},
     initAI:setPatheticWhiteSlime},
    {name:"Angry Red Slime",
     color:'#f00',
     backImageName:'cave',
     legacySkyColor:'#1e5000',
     legacyGroundColor:'#444',
     legacyBallColor:'#88f',
     newGroundColor:'#444',
     backTextColor:'#fff',
     initAI:setAngryRedSlime},
    {name:"Slime Master",
     color:'#000',
     backImageName:'sunset',
     legacySkyColor:'#623939',
     legacyGroundColor:'#00a800',
     legacyBallColor:'#fff',
     newGroundColor:'#655040',
     backTextColor:'#fff',
     initAI:setMasterSlime}
];
