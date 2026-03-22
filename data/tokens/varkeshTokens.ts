import { Unit } from "@/types"

export const VARKESH_TOKENS: Unit[] = [

{
 id:"varkesh_ghoul_token",
 baseName:"グール",
 name:"グール",
 mode:"unit",
 pack:"Varkesh",
 cost:0,

 hp:2,
 atk:1,
 attackRange: 1,
 role:"tank",

 effects:[],
 equipments:[],
 ephemeral: true,

 abilities:[
  {
    id: "ghoul_token_ability",
   trigger:"onDeath",
   effects:[
    {
     type:"DAMAGE",
     value:2,
     target:"random_enemy"
    }
   ]
  }
 ]

}

]