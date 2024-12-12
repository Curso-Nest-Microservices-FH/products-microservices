import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService')// Loger para que se vea en la terminal con el estilo Nest

  onModuleInit() { // implementacion de Prisma
    this.$connect()
    this.logger.log('Database Connected');
  }
  

  create(createProductDto: CreateProductDto) {

    return this.product.create({
      data: createProductDto
    })

    
    return 'This action adds a new product';
  }

  async findAll(paginationDto: PaginationDto) {
    
    const { page, limit } = paginationDto
    
    const totalPage = await this.product.count({ where: {available: true}})
    const lastPage = Math.ceil(totalPage/limit)



    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where:{
          available: true
        }
      }),
      meta: {
        total: totalPage,
        page: page,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {
    
   const product = await  this.product.findFirst({
      where: {id, available: true}
    })

    if (!product) {
      throw new RpcException({
        message: `Product with id ${id} not exists`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ... data} = updateProductDto

    await this.findOne(id)
    
    return this.product.update({
      where: {id},
      data: data
    })
  }

  async remove(id: number) {

    await this.findOne(id)

    // return this.product.delete({
    //   where: {id}
    // })

    const product = await this.product.update({
      where: {id},
      data: {
        available: false
      }
    })

    return product
  }



  async validateProducts(ids: number[]){

    ids = Array.from(new Set(ids))

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    if(products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST
      })
    }

    return products
  }
}
