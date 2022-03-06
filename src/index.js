import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import catimg from './assets/cat.png';
import hatimg from './assets/hat1.png';
import catHitbox from './assets/cat-shape2.json';
import shoe1img from './assets/shoe1.png';
import closetimg from './assets/closet.png';

var cat;
var closet;
var hat;
var clothingType;
var blankSprite;
var clothingTypes;

class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image('logo', logoImg);
        this.load.image('cat',catimg);
        this.load.image('hat1',hatimg);
        this.load.image('shoe1',shoe1img);
        this.load.image('closet',closetimg);
        this.load.json('catshape', catHitbox);
    }
      
    create ()
    {

        var catshape = this.cache.json.get('catshape');
        // this.arcade.world.setBounds(0, 0, game.config.width, game.config.hei

        this.matter.world.setGravity(0,0);
        closet = this.matter.add.sprite(200,200,'closet');
        closet.setStatic(true);
        closet.setScale(0.2);
        cat = this.matter.add.sprite(400,300,'cat',null, { shape: catshape});
        hat = this.matter.add.sprite(600,300,'hat1');

        //placeholder for shoes
        var shoe = this.matter.add.sprite(600,300,'shoe1');


        //Set up placeholder transparent sprite for closet
        blankSprite = this.matter.add.sprite(600,300,'hat1');
        blankSprite.setVisible(false);
        blankSprite.setSensor(true);
        blankSprite.setInteractive(false);

        //add a layer into the cat, it contains clothes that are equipped on the cat
        cat.setData('catLayer',this.add.layer());

        //set up sprite properties of catt
        cat.setStatic(true);
        cat.setSensor(true);
        cat.setScale(0.6);
        

        

        createClothingSnapPoints(cat);
        //did this because I dont think javascript has enums
        clothingTypes = {

            hat : 0,
            shoe : 1,
            shirt : 2,
            pants : 3,

        }

        //set up sprite properties of test hat object
        hat.setScale(0.2);
        hat.setInteractive();
        hat.setSensor(true);

        //set up sprite properties of test shoe object
        shoe.setScale(0.2);
        shoe.setInteractive();
        shoe.setSensor(true);

        //specify typing og test hat & test shoe 
        shoe.clothingType = clothingTypes.shoe;
        hat.clothingType = clothingTypes.hat;
        
        //set Spritees to be draggable
        this.input.setDraggable(hat);
        this.input.setDraggable(shoe);

        //Creates a layer acting as a closet category. Layer is like a type of array, but meant to store graphics objects.
        var hatGroup = this.add.layer();
        var shoeGroup = this.add.layer();

        //Adds items into layers/closet
        hatGroup.add(hat);
        shoeGroup.add(shoe);
        

        //Organizes hat items in layer in a grid. 
        //TODO: General method  instead of copy paste
        Phaser.Actions.GridAlign(hatGroup.getChildren(), {
                    width: 3,
                    height: 10,
                    cellWidth: 50,
                    cellHeight: 50,
                    x: 50,
                    y: 50
                });
        //Organizes shoe items in layer in a grid.
        Phaser.Actions.GridAlign(shoeGroup.getChildren(), {
                    width: 3,
                    height: 10,
                    cellWidth: 50,
                    cellHeight: 50,
                    x: 50,
                    y: 50
                });


        assignSpriteData(hatGroup,"hat");
        assignSpriteData(shoeGroup,"shoe");

        //Goes through each sprite in the object layer  and saves their origin position and index
        //Also saves what group they belong to
        //Needed for snapping back/un-equipping
        function assignSpriteData(objectLayer,type){
            objectLayer.each(function(gameObject) {
                gameObject.setData('origin', gameObject.getCenter());
                gameObject.setData('type', type);
                gameObject.setData('group', objectLayer);
                gameObject.setData('index', objectLayer.getIndex(gameObject));
            });
    
        }

        //only show hats first until toggle is pressed
        shoeGroup.setVisible(false);
        var layers = [shoeGroup,hatGroup];

    

        //Test button for switching between categories
        const togglebutton = this.add.text(40, 100, 'Toggle!', { fill: '#0f0' })
        .setInteractive()
        .on('pointerdown', () => toggleVisible(layers));

        //
        var self = this;

        //temporary function to emulate switching categories
        //When toggleButton is pressed,
        //swaps between two layers by making one invisible
        function toggleVisible(layers){
            for(const layer  of layers){
                if(layer.visible==true){
                    layer.setVisible(false);
                    layer.each(function(gameObject) {
                        if(gameObject != null){
                           gameObject.disableInteractive();
                            self.input.setDraggable(gameObject,false);
                        }
                    });
                }
                else{
                    layer.setVisible(true);
                    togglebutton.setText("Displaying: "+ layer.first.getData('type') + "group. Press to toggle.")
                    layer.each(function(gameObject) {
                        if(gameObject != null){
                            gameObject.setInteractive();
                            self.input.setDraggable(gameObject,true);
                        }
                    });
                }
            }
            return;
        }


        //different clothes snap to different places on cat. only shoe and hat right now
        function createClothingSnapPoints(cat){

            cat.hatPosition = { 
                x : 400,
                y : 300 - 180,
            }
    
            cat.shoePosition = { 
                x : 400,
                y : 300 + 149,
            }
            
            cat.shirtPosition = { //these values arent quite right. need test images i think before they can be set right.
                x : 400,
                y : 300,
            }
    
            cat.pantsPosition = { //these values arent quite right. need test images i think before they can be set right.
                x : 400,
                y : 300 + 70,
            }

        }


    }


    update(){
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.addToDispla
            gameObject.setScale(0.6);
            gameObject.x = dragX;
            gameObject.y = dragY;
            //snapToCat(gameObject,pointer);
        });

        this.input.on('dragend', (pointer, gameObject, dragX, dragY) => {
            snapToCat(gameObject,pointer);
        });

        //overlap check and snap
        function snapToCat(sprite, pointer) {
            if(Phaser.Geom.Intersects.RectangleToRectangle(sprite.getBounds(), cat.getBounds())){
                sprite.getData('group').replace(sprite,blankSprite );
                cat.getData('catLayer').add(sprite);

                //switch statement to handle multiple types of clothes
                switch (sprite.clothingType){
                    case clothingTypes.hat:
                        sprite.x = cat.hatPosition.x;
                        sprite.y = cat.hatPosition.y;
                        break;
                    case clothingTypes.shoe:
                        sprite.x = cat.shoePosition.x;
                        sprite.y = cat.shoePosition.y;
                        break;
                    case clothingTypes.shirt:
                        sprite.x = cat.shirtPosition.x;
                        sprite.y = cat.shirtPosition.y;
                        break;   
                    case clothingTypes.pants:
                        sprite.x = cat.pantsPosition.x;
                        sprite.y = cat.pantsPosition.y;
                        break;                                                 
                }


            }
            //Sprite shrinks and returns to closet if it is not dropped on cat.
            else{
                sprite.getData('group').addAt(sprite, sprite.getData('index'));
                sprite.setScale(0.2);
                sprite.x=sprite.getData('origin').x;
                sprite.y=sprite.getData('origin').y;
                
            }
        }
    }
}


const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    pixelArt:true,
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF',
    physics: {
        default: 'matter',
        matter: {
            debug: false
        }
    },
    scene: MyGame
};

const game = new Phaser.Game(config);
