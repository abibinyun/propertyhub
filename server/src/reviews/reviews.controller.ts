import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post('agent/:agentId')
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Param('agentId') agentId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, agentId, dto);
  }

  @Get('agent/:agentId/can-review')
  @UseGuards(JwtAuthGuard)
  canReview(@CurrentUser() user: any, @Param('agentId') agentId: string) {
    return this.reviewsService.canReview(user.id, agentId);
  }

  @Get('agent/:agentId')
  findByAgent(@Param('agentId') agentId: string) {
    return this.reviewsService.findByAgent(agentId);
  }
}
